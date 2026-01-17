import {
  FunctionDeclaration,
  Node,
  type SourceFile,
  type TypeChecker,
  TypeAliasDeclaration,
  type VariableDeclaration,
} from 'ts-morph';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as commentParser from 'comment-parser';
import type { EndpointDefinition, FormattedType, HTTP_METHOD } from '../../types/core.js';
import type { PluginLogger, ProcessedEndpoint } from '../types.js';
import { footprintOfType } from '../../utils/svelte-codegen.js';
import {
  extract_endpoint_response,
  extract_payload_node,
  extract_query_parameters,
} from '../../utils/endpoint_extractors.js';
import { extract_kit_error } from '../../lib/parsers/sveltekit/responses.js';
import { hashNode } from '../../utils/node_utils.js';

const HTTP_METHODS: HTTP_METHOD[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface DeclarationData {
  path?: Record<string, string>;
  query?: Record<string, FormattedType>;
  body?: FormattedType;
  responses: StatementResult[];
}

interface StatementResult {
  status: number;
  type: FormattedType;
}

/**
 * Silent spinner implementation that logs nothing (for use during processing)
 */
const silentSpinner = {
  start: () => silentSpinner,
  stop: () => silentSpinner,
  succeed: () => silentSpinner,
  fail: () => silentSpinner,
  warn: () => silentSpinner,
  info: () => silentSpinner,
  text: '',
};

/**
 * Processes endpoint files (SvelteKit +server.ts) to extract type information
 */
export class EndpointProcessor {
  private typeChecker: TypeChecker;
  private framework: string;
  private rootDir: string;
  private logger: PluginLogger;

  constructor(
    typeChecker: TypeChecker,
    framework: string,
    rootDir: string,
    logger: PluginLogger
  ) {
    this.typeChecker = typeChecker;
    this.framework = framework;
    this.rootDir = rootDir;
    this.logger = logger;
  }

  /**
   * Process a single endpoint file and extract all type information
   */
  processEndpointFile(sourceFile: SourceFile): ProcessedEndpoint {
    const filePath = sourceFile.getFilePath();
    const apiPath = this.filePathToApiPath(filePath);
    const methods = new Map<HTTP_METHOD, EndpointDefinition>();
    const typeImports = new Set<string>();

    this.logger.debug(`Processing endpoint: ${apiPath}`);

    // Get all exported declarations
    const exportedDeclarations = Array.from(sourceFile.getExportedDeclarations().values()).flat();

    // Filter for HTTP method handlers
    const httpHandlers = exportedDeclarations.filter((decl): decl is FunctionDeclaration | VariableDeclaration => {
      if (!Node.isFunctionDeclaration(decl) && !Node.isVariableDeclaration(decl)) {
        return false;
      }
      const name = decl.getName();
      return name !== undefined && HTTP_METHODS.includes(name as HTTP_METHOD);
    });

    // Process each HTTP method handler
    for (const declaration of httpHandlers) {
      const methodName = declaration.getName() as HTTP_METHOD;

      try {
        const definition = this.processDeclaration(methodName, filePath, apiPath, declaration);
        if (definition) {
          methods.set(methodName, definition);

          // Collect imports
          if (definition.imports) {
            for (const imp of definition.imports) {
              typeImports.add(imp);
            }
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to process ${methodName} in ${filePath}: ${error}`);
      }
    }

    // Compute content hash
    const content = sourceFile.getFullText();
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    return {
      filePath,
      apiPath,
      methods,
      typeImports,
      contentHash,
      processedAt: Date.now(),
    };
  }

  /**
   * Convert file path to API route path
   * e.g., /src/routes/api/users/[id]/+server.ts -> /api/users/:id
   */
  filePathToApiPath(filePath: string): string {
    return (
      filePath
        .split(this.rootDir)
        .at(-1)
        ?.split('routes')
        .at(-1)
        ?.split('/')
        .slice(0, -1) // Remove +server.ts
        .map((segment) => segment.replace(/\[([^\]]+)\]/g, ':$1'))
        .join('/') ?? '/'
    );
  }

  /**
   * Extract path parameters from the API path
   */
  private extractPathParams(apiPath: string): Record<string, string> {
    const params = apiPath.match(/:([^/]+)/g);
    const pathParams: Record<string, string> = {};

    if (params) {
      for (const param of params) {
        const paramName = param.slice(1);
        pathParams[paramName] = 'string';
      }
    }

    return pathParams;
  }

  /**
   * Process a type node to get its formatted representation
   */
  private processTypeNode(node: Node): FormattedType {
    const footprint = footprintOfType({
      type: this.typeChecker.getTypeAtLocation(node),
      node: node,
      typeChecker: this.typeChecker,
    });
    return footprint;
  }

  /**
   * Process a single HTTP method declaration
   */
  private processDeclaration(
    method: HTTP_METHOD,
    filePath: string,
    apiPath: string,
    declaration: FunctionDeclaration | VariableDeclaration
  ): EndpointDefinition | undefined {
    const result: DeclarationData = {
      path: this.extractPathParams(apiPath),
      responses: [],
    };

    // Try to get SvelteKit route params from $types.d.ts
    this.extractRootDirTypes(declaration);

    // Get all descendant nodes
    const nodes = this.getAllDeclarations(declaration);
    if (!nodes?.length) {
      return undefined;
    }

    const processedNodes = new Set<string>();

    for (const node of nodes) {
      const hash = hashNode(node);
      if (processedNodes.has(hash)) {
        continue;
      }

      // Extract query parameters
      const query = extract_query_parameters(node, this.typeChecker);
      if (query && Object.keys(query).length > 0) {
        result.query = query;
        continue;
      }

      // Extract body/payload
      const payloadNode = extract_payload_node(node);
      if (payloadNode) {
        result.body = this.processTypeNode(payloadNode);
        continue;
      }

      // Extract response
      const response = extract_endpoint_response(
        node,
        this.typeChecker,
        this.framework,
        silentSpinner as any
      );

      if (response?.type) {
        result.responses.push(response);
      }
    }

    // Extract JSDoc comments
    const jsdoc = this.extractJSDoc(declaration);

    // Build the endpoint definition
    const endpointDef: EndpointDefinition = {
      parameters: {
        path: result.path,
        query: result.query,
        body: result.body,
      },
      responses: {},
      errors: {},
      docs: jsdoc[0]?.[0] ? commentParser.stringify(jsdoc[0][0]) : undefined,
      imports: new Set<string>(),
    };

    // Process responses and categorize by status code
    for (const { status, type } of result.responses) {
      if (!this.isStatusOk(status)) {
        // Error response
        if (!endpointDef.errors[status]) {
          endpointDef.errors[status] = [];
        }
        endpointDef.errors[status].push(type);
      } else {
        // Success response
        if (!endpointDef.responses[status]) {
          endpointDef.responses[status] = [];
        }
        endpointDef.responses[status]!.push(type);
      }

      // Collect imports from response types
      if (type.imports) {
        for (const imp of type.imports) {
          endpointDef.imports.add(imp);
        }
      }
    }

    // Collect imports from parameters
    if (result.body?.imports) {
      for (const imp of result.body.imports) {
        endpointDef.imports.add(imp);
      }
    }

    if (result.query) {
      for (const param of Object.values(result.query)) {
        if (param.imports) {
          for (const imp of param.imports) {
            endpointDef.imports.add(imp);
          }
        }
      }
    }

    return endpointDef;
  }

  /**
   * Get all descendant declarations from a function or variable declaration
   */
  private getAllDeclarations(declaration: FunctionDeclaration | VariableDeclaration): Node[] | undefined {
    if (declaration instanceof FunctionDeclaration) {
      return declaration.getDescendants();
    }
    if (TypeAliasDeclaration.isTypeAliasDeclaration(declaration)) {
      return declaration.getDescendants();
    }
    return declaration.getInitializer()?.getDescendants();
  }

  /**
   * Extract SvelteKit route params from the generated $types.d.ts file
   */
  private extractRootDirTypes(declaration: FunctionDeclaration | VariableDeclaration): void {
    if (this.framework !== 'sveltekit') {
      return;
    }

    const requestEventTypePath = path.resolve(
      this.rootDir,
      declaration
        .getSourceFile()
        .getFilePath()
        .replace(this.rootDir, '.svelte-kit/types')
        .replace('/+server.ts', '/$types.d.ts')
    );

    if (!fs.existsSync(requestEventTypePath)) {
      // $types.d.ts not found - this is okay, route params will default to string
      return;
    }

    // Note: We could enhance path param types here from RouteParams
    // For now, we just verify the file exists
  }

  /**
   * Extract JSDoc comments from a declaration
   */
  private extractJSDoc(declaration: FunctionDeclaration | VariableDeclaration): any[] {
    return declaration
      .getDescendantStatements()
      .flatMap((statement) => statement.getLeadingCommentRanges())
      .map((range) => range.getText())
      .map((comment) => this.tryParseJsDocComment(comment))
      .filter(
        (jsdoc) =>
          jsdoc &&
          jsdoc.length > 0 &&
          jsdoc[0]?.tags.some((tag: any) => tag.tag === 'svetch')
      );
  }

  /**
   * Try to parse a JSDoc comment, returning null on failure
   */
  private tryParseJsDocComment(comment: string): any {
    try {
      return commentParser.parse(comment);
    } catch {
      return null;
    }
  }

  /**
   * Check if a status code indicates success (2xx)
   */
  private isStatusOk(status: number): boolean {
    return status >= 200 && status < 300;
  }
}
