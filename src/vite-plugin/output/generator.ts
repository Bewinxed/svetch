import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EndpointDefinition, FormattedType, HTTP_METHOD } from '../../types/core.js';
import type { GeneratedFile, PluginLogger, ProcessedEndpoint, ResolvedPluginOptions } from '../types.js';
import { generate_tsoa_shema } from '../../utils/tsoa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up to find assets folder
const ASSETS_DIR = path.resolve(__dirname, '../../assets');

/**
 * Generates output files from processed endpoints
 */
export class OutputGenerator {
  private outputDir: string;
  private options: ResolvedPluginOptions;
  private logger: PluginLogger;

  constructor(outputDir: string, options: ResolvedPluginOptions, logger: PluginLogger) {
    this.outputDir = outputDir;
    this.options = options;
    this.logger = logger;
  }

  /**
   * Generate all output files from a complete set of endpoints
   */
  async generateFull(endpoints: Map<string, ProcessedEndpoint>): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Ensure output directory exists
    await fs.promises.mkdir(this.outputDir, { recursive: true });

    // Generate api.ts with all types
    const apiContent = this.generateApiTypes(endpoints);
    files.push({ path: 'api.ts', content: apiContent });
    await this.writeFile('api.ts', apiContent);

    // Generate client.ts
    const clientContent = await this.generateClient();
    files.push({ path: 'client.ts', content: clientContent });
    await this.writeFile('client.ts', clientContent);

    // Generate interfaces.ts
    const interfacesContent = await this.getInterfacesTemplate();
    files.push({ path: 'interfaces.ts', content: interfacesContent });
    await this.writeFile('interfaces.ts', interfacesContent);

    // Generate OpenAPI schema
    try {
      await this.generateOpenApiSchema(endpoints);
    } catch (error) {
      this.logger.warn(`Failed to generate OpenAPI schema: ${error}`);
    }

    // Generate docs
    try {
      await this.generateDocs();
    } catch (error) {
      this.logger.warn(`Failed to generate docs: ${error}`);
    }

    this.logger.info(`Generated ${files.length} files`);
    return files;
  }

  /**
   * Generate only changed files incrementally
   */
  async generateIncremental(
    changedEndpoints: Map<string, ProcessedEndpoint>,
    allEndpoints: Map<string, ProcessedEndpoint>,
    removedEndpoints: Set<string>
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // For now, regenerate api.ts on any change
    // In the future, we could make this smarter with per-endpoint files
    const apiContent = this.generateApiTypes(allEndpoints);
    const apiPath = 'api.ts';

    // Only write if content changed
    const existingContent = await this.readFileIfExists(apiPath);
    if (existingContent !== apiContent) {
      files.push({ path: apiPath, content: apiContent });
      await this.writeFile(apiPath, apiContent);
    }

    // Regenerate OpenAPI schema
    try {
      await this.generateOpenApiSchema(allEndpoints);
    } catch (error) {
      this.logger.warn(`Failed to generate OpenAPI schema: ${error}`);
    }

    return files;
  }

  /**
   * Generate the api.ts file with all endpoint types
   */
  private generateApiTypes(endpoints: Map<string, ProcessedEndpoint>): string {
    const imports = new Set<string>();
    let output = '';

    // HTTP method type interfaces
    const methodTypes: Partial<Record<HTTP_METHOD, string>> = {
      GET: '',
      POST: '',
      PUT: '',
      DELETE: '',
      PATCH: '',
    };

    // Track which methods have endpoints
    const methodsWithEndpoints = new Set<HTTP_METHOD>();

    // Process each endpoint
    for (const [, endpoint] of endpoints) {
      for (const [method, definition] of endpoint.methods) {
        if (!methodTypes[method]) {
          methodTypes[method] = `export interface ${method} {\n`;
        }
        methodsWithEndpoints.add(method);

        methodTypes[method] += `  '${endpoint.apiPath}': {\n`;

        // Add docs
        if (definition.docs) {
          methodTypes[method] += `    ${definition.docs}\n`;
        }

        // Add parameters
        methodTypes[method] += `    parameters: ${this.generateParametersType(definition.parameters)};\n`;

        // Collect imports from parameters
        if (definition.parameters?.body?.imports) {
          for (const imp of definition.parameters.body.imports) {
            imports.add(imp);
          }
        }

        if (definition.imports) {
          for (const imp of definition.imports) {
            imports.add(imp);
          }
        }

        // Add responses
        if (definition.responses) {
          for (const [, responses] of Object.entries(definition.responses)) {
            if (responses) {
              for (const response of responses) {
                if (response.imports) {
                  for (const imp of response.imports) {
                    imports.add(imp);
                  }
                }
              }
            }
          }
          methodTypes[method] += `    responses: ${
            definition.responses
              ? this.generateResponsesType(definition.responses)
              : 'never'
          };\n`;
        }

        // Add errors
        if (definition.errors && Object.keys(definition.errors).length > 0) {
          methodTypes[method] += `    errors: ${this.generateErrorsType(definition.errors, imports)};\n`;
        } else {
          methodTypes[method] += '    errors?: never;\n';
        }

        methodTypes[method] += '  };\n';
      }
    }

    // Close method interfaces and add empty types for unused methods
    for (const [method, methodType] of Object.entries(methodTypes)) {
      if (methodsWithEndpoints.has(method as HTTP_METHOD)) {
        output += `${methodType}}\n\n`;
      } else {
        output += `export type ${method} = object;\n\n`;
      }
    }

    // Create APIPaths union type
    const apiPathsUnion = Object.keys(methodTypes).join(' & ');
    output += `export type APIPaths = ${apiPathsUnion};\n`;

    // Get interfaces template
    const interfacesContent = this.getInterfacesTemplateSync();

    // Build final output
    const importsString = Array.from(imports).join('\n');
    return `${importsString}\n\n${interfacesContent}\n${output}`;
  }

  /**
   * Generate the parameters type string
   */
  private generateParametersType(parameters?: EndpointDefinition['parameters']): string {
    if (!parameters) {
      return 'undefined';
    }

    const parts: string[] = [];

    if (parameters.body) {
      const bodyType = parameters.body.typeString?.replace(/.*\//, '') ?? 'unknown';
      parts.push(`body: ${bodyType}`);
    }

    if (parameters.path && Object.keys(parameters.path).length > 0) {
      const pathParams = Object.entries(parameters.path)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
      parts.push(`path: { ${pathParams} }`);
    } else {
      parts.push('path?: never');
    }

    if (parameters.query && Object.keys(parameters.query).length > 0) {
      const queryParams = Object.entries(parameters.query)
        .map(([key, value]) => `${key}: ${value.typeString ?? 'string'}`)
        .join('; ');
      parts.push(`query: { ${queryParams} }`);
    }

    return `{\n      ${parts.join(';\n      ')}\n    }`;
  }

  /**
   * Generate the responses type string
   */
  private generateResponsesType(responses: Partial<Record<number, FormattedType[]>>): string {
    const parts: string[] = [];

    for (const [status, responseArray] of Object.entries(responses)) {
      if (responseArray && responseArray.length > 0) {
        const types = responseArray
          .map((r) => r.typeString ?? 'unknown')
          .join(' | ');
        parts.push(`${status}: ${types}`);
      }
    }

    if (parts.length === 0) {
      return 'never';
    }

    return `{\n      ${parts.join(';\n      ')}\n    }`;
  }

  /**
   * Generate the errors type string
   */
  private generateErrorsType(
    errors: Record<string, FormattedType[]>,
    imports: Set<string>
  ): string {
    const parts: string[] = [];

    for (const [status, errorArray] of Object.entries(errors)) {
      if (errorArray && errorArray.length > 0) {
        for (const error of errorArray) {
          if (error.imports) {
            for (const imp of error.imports) {
              imports.add(imp);
            }
          }
        }
        const types = errorArray
          .map((e) => e.typeString ?? 'unknown')
          .join(' | ');
        parts.push(`${status}: ${types}`);
      }
    }

    if (parts.length === 0) {
      return 'never';
    }

    return `{\n      ${parts.join(';\n      ')}\n    }`;
  }

  /**
   * Generate the client.ts file
   */
  private async generateClient(): Promise<string> {
    const clientTemplate = await fs.promises.readFile(
      path.join(ASSETS_DIR, 'client.ts'),
      'utf-8'
    );
    return clientTemplate;
  }

  /**
   * Get the interfaces template
   */
  private async getInterfacesTemplate(): Promise<string> {
    return fs.promises.readFile(
      path.join(ASSETS_DIR, 'interfaces.ts'),
      'utf-8'
    );
  }

  /**
   * Get the interfaces template synchronously (for embedding in api.ts)
   */
  private getInterfacesTemplateSync(): string {
    try {
      return fs.readFileSync(
        path.join(ASSETS_DIR, 'interfaces.ts'),
        'utf-8'
      );
    } catch {
      // Fallback if assets not found
      return '';
    }
  }

  /**
   * Generate OpenAPI schema
   */
  private async generateOpenApiSchema(endpoints: Map<string, ProcessedEndpoint>): Promise<void> {
    // Convert ProcessedEndpoint map to the format expected by generate_tsoa_shema
    const endpointsMap = new Map<string, Map<HTTP_METHOD, EndpointDefinition>>();

    for (const [, endpoint] of endpoints) {
      endpointsMap.set(endpoint.apiPath, endpoint.methods);
    }

    try {
      await generate_tsoa_shema(endpointsMap, this.options.staticFolder);
    } catch (error) {
      // OpenAPI generation is optional, don't fail the build
      if (error instanceof Error && error.message.includes('model definitions')) {
        this.logger.warn(
          'OpenAPI schema generation failed: duplicate model names. ' +
          'Use @tsoaModel JSDoc tag to resolve.'
        );
      }
    }
  }

  /**
   * Generate documentation files
   */
  private async generateDocs(): Promise<void> {
    const docsPath = path.resolve(this.options.docs);

    // Ensure docs directory exists
    await fs.promises.mkdir(docsPath, { recursive: true });

    // Copy docs template
    try {
      const docsTemplate = await fs.promises.readFile(
        path.join(ASSETS_DIR, 'docs', '+page.svelte'),
        'utf-8'
      );

      const staticFolder = path.resolve(this.options.staticFolder);
      const docsContent = docsTemplate.replace('[STATIC_FOLDER]', staticFolder);

      await fs.promises.writeFile(
        path.join(docsPath, '+page.svelte'),
        docsContent,
        'utf-8'
      );
    } catch {
      // Docs generation is optional
    }
  }

  /**
   * Write a file to the output directory
   */
  private async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.outputDir, relativePath);
    const dir = path.dirname(fullPath);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Read a file if it exists, return undefined otherwise
   */
  private async readFileIfExists(relativePath: string): Promise<string | undefined> {
    const fullPath = path.join(this.outputDir, relativePath);
    try {
      return await fs.promises.readFile(fullPath, 'utf-8');
    } catch {
      return undefined;
    }
  }
}
