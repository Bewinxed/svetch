import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as commentParser from "comment-parser";

import {
  CallExpression,
  type CatchClause,
  FunctionDeclaration,
  Identifier,
  type ImportDeclaration,
  NewExpression,
  Node,
  NumericLiteral,
  ObjectLiteralExpression,
  Project,
  PropertyAccessExpression,
  PropertyAssignment,
  type SourceFile,
  StringLiteral,
  SyntaxKind,
  type ThrowStatement,
  TypeAliasDeclaration,
  type TypeChecker,
  type TypeNode,
  type TypeReferenceNode,
  type VariableDeclaration,
  type VariableStatement,
} from "ts-morph";
import type {
  EndpointDefinition,
  Endpoints,
  ErrorDetails,
  FormattedType,
  HTTP_METHOD,
  ScriptArgs,
} from "./types/core.js";

import { fileURLToPath } from "node:url";
import ansiColors from "ansi-colors";
import { parseSchema } from "json-schema-to-zod";
import ora, { type Ora } from "ora";
import { extract_kit_error } from "./lib/parsers/sveltekit/responses.js";
import type { Telemetry } from "./types/telemetry.js";
import {
  extract_endpoint_response,
  extract_payload_node,
  extract_query_parameters,
  extractPayloadTypeNode,
} from "./utils/endpoint_extractors.js";
import {
  log,
  log_node_with_location,
  node_location_and_line,
} from "./utils/logger.js";
import { footprintOfType } from "./utils/svelte-codegen.js";
import { generate_tsoa_shema } from "./utils/tsoa.js";
import { brackets, newline } from "./utils/writers.js";
import { hashNode } from "./utils/node_utils.js";
import { entries } from "./utils/helpers/type.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const workingDir = path.resolve(".") || process.env.INIT_CWD || process.cwd();

const separator = "--------------------------------------";

// process.on('SIGUSR2', function () {
//   const snapshotFile = '/path/to/your/project/heap-' + Date.now() + '.heapsnapshot';
//   heapdump.writeSnapshot(snapshotFile, (err) => {
//     if (err) console.error(err);
//     else console.log(`Heap dump written to ${snapshotFile}`);
//   });
// });

// this won't send if you disable telemetry
const telemetryPayload: Telemetry = {
  _id: crypto.randomUUID(),
  // read from svelte.config.js
  project: workingDir.split("/").pop()!,
  timestamp: Date.now(),
  data: {
    session_id: crypto.randomUUID(),
    script_name: "svetch",
    operating_system: os.platform(),
    node_version: process.version,
    npm_version: process.env.npm_package_version || "unknown",
    encountered_errors: false,
    error_messages: [],
    processed_files_count: 0,
    generated_lines_of_code: 0,
    processed_endpoints: {
      POST: 0,
      GET: 0,
      PUT: 0,
      PATCH: 0,
      DELETE: 0,
    },
  },
};

let {
  tsconfig,
  framework,
  input,
  out,
  logLevel,
  filter,
  docs,
  staticFolder,
  telemetry,
} = {} as ScriptArgs;

let project: Project;
let typeChecker: TypeChecker;

let outputPath: string;
let schemaOutputPath: string;
let docsOutputPath: string;
const endpoints: Endpoints = new Map();
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const actions: Record<string, Record<string, any>> = {};
const importMap = {};

function processTypeNode(node: Node): FormattedType {
  const footprint = footprintOfType({
    type: typeChecker.getTypeAtLocation(node),
    node: node,
    typeChecker: typeChecker,
  });
  // console.error(node.getText(), footprint.typeString);
  // if the type is any
  if (footprint.typeString === "any") {
    // console.error(node.getKindName(), node.getText());
  }
  return footprint;
}

function extractPathParams(path: string): Record<string, string> {
  const params = path.match(/:([^/]+)/g);
  const pathParams: Record<string, string> = {};

  if (params) {
    for (const param of params) {
      const paramName = param.slice(1);
      pathParams[paramName] = "string";
    }
  }

  return pathParams;
}

function extractQueryParameters(
  declaration: FunctionDeclaration,
  method: EndpointDefinition,
  typeChecker: TypeChecker
) {
  const queryParameters: Record<string, string> = {};

  const searchParamsVariables = new Set<string>();

  declaration.forEachDescendant((node: Node) => {
    // Detect any declaration of url.searchParams and store the variable name
    if (Node.isVariableDeclaration(node)) {
      const initializer = node.getInitializer();

      if (initializer && Node.isPropertyAccessExpression(initializer)) {
        const expression = initializer.getExpression();
        const property = initializer.getName();

        if (expression.getText() === "url" && property === "searchParams") {
          const variableName = node.getName();
          searchParamsVariables.add(variableName);
        }
      }
    }

    // Detect usage of url.searchParams.get(x) or variable.get(x) or variable[x]
    if (Node.isCallExpression(node) || Node.isElementAccessExpression(node)) {
      let expression = node.getExpression();

      if (Node.isPropertyAccessExpression(expression)) {
        const object = expression.getExpression();
        const property = expression.getName();

        if (
          (object.getText() === "url.searchParams" && property === "get") ||
          (searchParamsVariables.has(object.getText()) && property === "get")
        ) {
          const args = node.getArguments();

          if (args.length > 0 && Node.isStringLiteral(args[0])) {
            const queryParameterName = args[0].getLiteralText();
            const paramType = typeChecker
              .getTypeAtLocation(node.getParent())
              .getText();
            queryParameters[queryParameterName] = paramType;
          }
        }
      } else if (Node.isElementAccessExpression(expression)) {
        const expressionName = expression.getExpression().getText();

        if (searchParamsVariables.has(expressionName)) {
          const argumentExpression = expression.getArgumentExpression();
          if (argumentExpression && Node.isStringLiteral(argumentExpression)) {
            const queryParameterName = argumentExpression.getLiteralText();
            const paramType = footprintOfType({
              type: typeChecker.getTypeAtLocation(node),
              node: node,
              typeChecker: typeChecker,
            });
            method.imports ??= new Set();
            if (paramType.imports) {
              for (const imp of paramType.imports) {
                method.imports.add(imp);
              }
            }
            queryParameters[queryParameterName] = paramType.typeString;
          }
        }
      }
    }

    // Get the type of the constant when the query string is assigned to it
    if (Node.isVariableDeclaration(node)) {
      const initializer = node.getInitializer();

      if (
        initializer &&
        (Node.isCallExpression(initializer) ||
          Node.isElementAccessExpression(initializer))
      ) {
        const expression = initializer.getExpression();

        if (Node.isPropertyAccessExpression(expression)) {
          const object = expression.getExpression();
          const property = expression.getName();

          if (
            (object.getText() === "url.searchParams" && property === "get") ||
            (searchParamsVariables.has(object.getText()) && property === "get")
          ) {
            const variableType = typeChecker.getTypeAtLocation(node);
            const variableName = node.getName();
            queryParameters[variableName] = variableType.getText();
          }
        } else if (Node.isElementAccessExpression(expression)) {
          const expressionName = expression.getExpression().getText();

          if (searchParamsVariables.has(expressionName)) {
            const variableType = typeChecker.getTypeAtLocation(node);
            const variableName = node.getName();
            queryParameters[variableName] = variableType.getText();
          }
        }
      }
    }
  });

  // if no query parameters, return undefined
  if (Object.keys(queryParameters).length === 0) {
    return;
  }

  return queryParameters;
}

function warnIfResultsNotUsedInResponse(
  declaration: FunctionDeclaration
): void {
  const resultsName = "results";
  let isResultsUsedInResponse = false;

  declaration.forEachDescendant((node: Node) => {
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();

      // Check if the call expression is 'json' or 'Response'
      if (
        Node.isIdentifier(expression) &&
        (expression.getText() === "json" || expression.getText() === "Response")
      ) {
        // Check if 'results' is used in the arguments
        const args = node.getArguments();
        for (const arg of args) {
          if (arg.getText().includes(resultsName)) {
            isResultsUsedInResponse = true;
            break;
          }
        }
      }
    }
  });

  // If 'results' is not used in any 'json' or 'Response' call, log a warning
  if (!isResultsUsedInResponse) {
    log.warn(
      3,
      `		[WARN]: 'results' is not used in a 'json' or 'Response' function call in
				 ${declaration.getFunctions()?.at(0)?.getName()}`
    );
  }
}

// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
function extractErrorDetails(node: Node): ErrorDetails<any> | null {
  if (Node.isThrowStatement(node)) {
    return extractFromThrowStatement(node);
  }
  if (Node.isCatchClause(node)) {
    return extractFromCatchClause(node);
  }
  if (Node.isCallExpression(node)) {
    return extractFromCallExpression(node);
  }
  // console.error(node.getKindName(), node.getText());
  return null;
}

function extractFromThrowStatement(
  node: ThrowStatement
  // biome-ignore lint/suspicious/noExplicitAny: This is a generic function
): ErrorDetails<any> | null {
  const expression = node.getExpression();
  if (Node.isNewExpression(expression)) {
    const args = expression.getArguments();
    if (
      args.length >= 2 &&
      Node.isNumericLiteral(args[0]) &&
      Node.isStringLiteral(args[1])
    ) {
      return {
        status: Number(args[0].getLiteralValue()),
        node: args[1],
      };
    }
  }
  return null;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function extractFromCatchClause(node: CatchClause): ErrorDetails<any> | null {
  const throwStatement = node
    .getBlock()
    .getFirstDescendantByKind(SyntaxKind.ThrowStatement);
  if (throwStatement) {
    const result = extractFromThrowStatement(throwStatement);
    if (result) {
      const variableDeclaration = node.getVariableDeclaration();
      if (variableDeclaration) {
        result.node = variableDeclaration;
      }
      return result;
    }
  }
  return null;
}

function extractFromCallExpression(
  node: CallExpression
  // biome-ignore lint/suspicious/noExplicitAny: This is a generic function
): ErrorDetails<any> | null {
  if (framework === "sveltekit" && node.getText().includes("error(")) {
    return extract_kit_error(node);
  }
  const expression = node.getExpression();
  if (Node.isIdentifier(expression) && expression.getText() === "error") {
    const args = node.getArguments();
    if (
      args.length >= 2 &&
      Node.isNumericLiteral(args[0]) &&
      Node.isStringLiteral(args[1])
    ) {
      return {
        status: Number(args[0].getLiteralValue()),
        node: args[1],
      };
    }
  }
  return null;
}

const apiParams: Record<string, TypeNode> = {};

function extractRootDirTypes(
  declaration: FunctionDeclaration | VariableDeclaration,
  spinner: Ora
) {
  if (framework === "sveltekit") {
    const requestEventTypePath = path.resolve(
      workingDir,
      declaration
        .getSourceFile()
        .getFilePath()
        .replace(workingDir, ".svelte-kit/types")
        .replace("/+server.ts", "/$types.d.ts")
    );

    if (!fs.existsSync(requestEventTypePath)) {
      spinner.warn(
        `${ansiColors.yellow(
          'No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed'
        )}`
      );
      return;
    }

    const routeParamsType = project
      .addSourceFileAtPath(requestEventTypePath)
      ?.getTypeAlias("RouteParams");

    if (!routeParamsType) {
      spinner.warn(
        `No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed`
      );
      return;
    }

    const routeParamTypeNode = routeParamsType.getTypeNode();
    if (routeParamTypeNode) {
      apiParams[declaration.getSourceFile().getFilePath()] = routeParamTypeNode;
    }

    return declaration;
  }
}

function tryParseJsDocComment(comment: string) {
  try {
    return commentParser.parse(comment);
  } catch (e) {
    log.error(3, `Failed to parse comment: ${comment}`);
    return null;
  }
}

type DeclarationData = {
  path?: Record<string, string>;
  query?: Record<string, FormattedType>;
  body?: FormattedType;
  responses: StatementResult[];
};

function process_declaration(
  method: HTTP_METHOD,
  file_path: string,
  api_path: string,
  declaration: FunctionDeclaration | VariableDeclaration,
  spinner: Ora
): DeclarationData | undefined {
  const result: DeclarationData = {
    path: extractPathParams(api_path),
    responses: [],
  };
  const nodes = getAllDeclarations(declaration);

  if (!nodes?.length) {
    return;
  }
  const processed_nodes = new Set<string>();
  for (const node of nodes) {
    const hash = hashNode(node);
    if (processed_nodes.has(hash)) {
      continue;
    }
    // processed_nodes.add(hash);
    const query = extract_query_parameters(node, typeChecker);
    if (query && Object.keys(query).length > 0) {
      result.query = query;
      continue;
    }

    const payload_node = extract_payload_node(node);
    if (payload_node) {
      result.body = processTypeNode(payload_node);
      continue;
    }

    const response = extract_endpoint_response(
      node,
      typeChecker,
      framework,
      spinner
    );

    if (response?.type) {
      result.responses.push(response);
    }
  }
  if (!result.body && method !== "GET") {
    spinner.warn(
      `No request body declaration found for ${method} method in ${file_path}`
    );
  }
  return result;
}

async function processFunctionDeclaration(
  declaration: FunctionDeclaration | VariableDeclaration
): Promise<void> {
  const http_method = declaration.getName() as HTTP_METHOD;
  const spinner = ora({
    text: `${http_method}`,
    color: "yellow",
    indent: 5,
  }).start();
  const file_path = declaration.getSourceFile().getFilePath();
  const api_path = file_path_to_endpoint_url(file_path);

  const endpoint =
    endpoints.get(api_path) ||
    // biome-ignore lint/style/noNonNullAssertion: This will always be truthy
    endpoints.set(api_path, new Map()).get(api_path)!;

  if (framework === "sveltekit") {
    extractRootDirTypes(declaration, spinner);
  }

  const result = process_declaration(
    http_method,
    file_path,
    api_path,
    declaration,
    spinner
  );
  if (!result) {
    spinner.fail(
      `No declarations found for ${http_method} method in ${file_path}`
    );
    return;
  }

  const jsdoc = extractJSDoc(declaration);

  const method =
    endpoint.get(http_method) ||
    (endpoint
      .set(http_method, {
        imports: new Set(),
        responses: {},
        errors: {},
        docs: "",
        parameters: {},
      })
      .get(http_method) as EndpointDefinition);

  method.parameters = {
    path: result.path,
    query: result.query,
    body: result.body,
  };
  method.docs = jsdoc[0]?.[0]
    ? commentParser.stringify(jsdoc[0][0])
    : undefined;
  for (const { status, type } of result.responses) {
    if (!isStatusOk(status)) {
      if (!method.errors[status]) {
        method.errors[status] = [];
      }
      method.errors[status].push(type);
    } else {
      if (!method.responses[status]) {
        method.responses[status] = [];
      }
      method.responses[status].push(type);
    }
  }

  if (!method.responses) {
    spinner.warn(
      `No response body found for ${http_method} method in ${file_path}, (Declare this using const results = {...}, new Response(...), or json(...))`
    );
  }
}

// Helper functions

function file_path_to_endpoint_url(filePath: string): string {
  return (
    filePath
      .split(process.cwd())
      .at(-1)
      ?.split("routes")
      .at(-1)
      ?.split("/")
      .slice(0, -1)
      // path param to :param
      .map((segment) => segment.replace(/\[([^\]]+)\]/g, ":$1"))
      .join("/") as string
  );
}

function getAllDeclarations(
  declaration: FunctionDeclaration | VariableDeclaration
) {
  // console.log(declaration.getKindName());
  return declaration instanceof FunctionDeclaration
    ? declaration.getDescendants()
    : TypeAliasDeclaration.isTypeAliasDeclaration(declaration)
    ? declaration.getDescendants()
    : declaration.getInitializer()?.getDescendants();
}

function extractJSDoc(declaration: FunctionDeclaration | VariableDeclaration) {
  return declaration
    .getDescendantStatements()
    .flatMap((statement) => statement.getLeadingCommentRanges())
    .map((range) => range.getText())
    .map((comment) => tryParseJsDocComment(comment))
    .filter(
      (jsdoc) =>
        jsdoc &&
        jsdoc.length > 0 &&
        jsdoc[0]?.tags.some((tag) => tag.tag === "svetch")
    );
}

function isStatusOk(status: number) {
  return status >= 200 && status < 300;
}

type StatementResult = {
  status: number;
  type: FormattedType;
};

function processFailExpression(
  expression: CallExpression,
  status: number,
  resultsDeclaration: TypeReferenceNode | undefined
) {
  // process fail(401, {...body}), first argument is the status code, second is the body
  const args = expression.getArguments();
  if (args.length > 0) {
    const arg = args.find((arg) => NumericLiteral.isNumericLiteral(arg));
    if (arg) {
      status = Number.parseInt(arg.getText());
    }
  }
  if (args.length > 1) {
    const arg = args.find(
      (arg) => arg.getKind() == SyntaxKind.ObjectLiteralExpression
    );
    if (arg) {
      const properties = arg.getProperties();
      if (properties.length > 0) {
        const property = properties[0];
        const initializer = property.getInitializer();
        if (initializer) {
          resultsDeclaration = initializer as TypeReferenceNode;
        }
      }
    }
  }
  return { status, resultsDeclaration };
}

async function processTypeDeclaration(
  declaration: TypeAliasDeclaration,
  spinner: Ora
) {
  const file = declaration.getSourceFile();
  // Add the original logic for handling TypeAliasDeclaration here
  // based on your previous code.
  const filePath = declaration.getSourceFile().getFilePath();
  const apiPath = filePath
    .slice(filePath.indexOf("api/") + 4, filePath.lastIndexOf("/"))
    .replace(/\[\w+\]/g, ":$&")
    .replace(/\[|\]/g, "");

  const typeNode = declaration.getTypeNodeOrThrow();

  const methodType = declaration.getName().replace("_", "").toUpperCase();

  if (
    methodType !== "GET" &&
    methodType !== "POST" &&
    methodType !== "PUT" &&
    methodType !== "PATCH" &&
    methodType !== "DELETE"
  ) {
    return;
  }

  init_endpoint({
    path: apiPath,
    method: "GET",
  });

  if (!endpoints[apiPath][methodType]) {
    throw new Error(`Docs not set for ${apiPath} ${methodType}`);
  }

  const typeArguments = (typeNode as TypeReferenceNode).getTypeArguments();

  let pathParam = processTypeNode(typeArguments[0]);
  let queryOrBodyParam = processTypeNode(typeArguments[1]);

  if (methodType === "GET" || methodType === "DELETE") {
    endpoints[apiPath][methodType]["parameters"] = {
      path: pathParam,
      query: queryOrBodyParam,
    };
  } else {
    // for 'PUT', 'POST', and 'PATCH', always assign `query` to `undefined`
    endpoints[apiPath][methodType]["parameters"] = {
      path: pathParam,
      body: queryOrBodyParam,
      query: undefined,
    };
  }

  if (!endpoints[apiPath][methodType]["responses"]) {
    endpoints[apiPath][methodType]["responses"] = {};
  }

  const processedTypeNode = processTypeNode(
    typeArguments[typeArguments.length - 1]
  );

  endpoints[apiPath][methodType]["responses"][200] = processedTypeNode;

  // collect all imported types
  file
    .getImportDeclarations()
    .forEach((importDeclaration: ImportDeclaration) => {
      importDeclaration.getNamedImports().forEach((namedImport) => {
        importMap[namedImport.getName()] =
          importDeclaration.getModuleSpecifierValue();
      });
    });
}

async function processActionsDeclaration(
  declaration: TypeAliasDeclaration,
  spinner: Ora
) {
  const file = declaration.getSourceFile();
  // Add the original logic for handling TypeAliasDeclaration here
  // based on your previous code.
  const filePath = declaration.getSourceFile().getFilePath();
  const apiPath = filePath
    .slice(filePath.indexOf("api/") + 4, filePath.lastIndexOf("/"))
    .replace(/\[\w+\]/g, ":$&")
    .replace(/\[|\]/g, "");

  if (!actions[apiPath]) {
    actions[apiPath] = {};
  }

  const methodType = "ACTION";

  if (!actions[apiPath][methodType]) {
    actions[apiPath][methodType] = {};
  }

  const objectLiteral = declaration.getFirstChildByKind(
    SyntaxKind.ObjectLiteralExpression
  );

  if (!objectLiteral) {
    log.warn(2, `No object literal found for ${apiPath}`);
    return;
  }

  // process each action inside the declaration

  objectLiteral.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.PropertyAssignment) {
      const actionName = node.getSymbol()?.getName()!;
      const payloadStatement = node
        .getFirstDescendantByKind(SyntaxKind.ArrowFunction)
        ?.getFirstDescendantByKind(SyntaxKind.Block)
        ?.getFirstDescendantByKind(SyntaxKind.SyntaxList)
        ?.getChildrenOfKind(SyntaxKind.VariableStatement)
        .find((child: VariableStatement) => {
          const name = child
            .getFirstDescendantByKind(SyntaxKind.Identifier)
            ?.getText();
          if (name === "payload") {
            log.success(3, `Detected payload declaration`);
            return true;
          }

          return false;
        })
        ?.getFirstDescendantByKind(SyntaxKind.Identifier);

      if (!payloadStatement) {
        log.warn(
          2,
          `No payload declaration found for ${apiPath}.${actionName}`
        );
        return;
      }

      const payloadType = typeChecker
        .getTypeAtLocation(payloadStatement)
        .getText();

      if (!actions[apiPath][methodType][actionName]) {
        actions[apiPath][methodType][actionName] = {
          parameters: {
            path: {},
            query: {},
            body: {},
          },
          responses: {},
          errors: {},
        };
      }
      actions[apiPath][methodType][actionName]["parameters"]["body"] =
        payloadType;

      let status = 200;

      let resultsDeclaration: TypeReferenceNode | undefined;

      let addedResponses = new Set();

      // convert below to for...of
      for (const subnode of node.getDescendants()) {
        if (Node.isReturnStatement(subnode)) {
          const expression = subnode.getExpression();

          if (!expression) {
            log.error(3, "Detected return statement without expression");
            return;
          }

          if (subnode.getText().includes("fail")) {
            log.error(3, "Detected return statement with fail");
            ({ status, resultsDeclaration } = processFailExpression(
              expression,
              status,
              resultsDeclaration
            ));
            if (resultsDeclaration) {
              const processedResponse = processTypeNode(resultsDeclaration);
              if (!actions[apiPath][methodType][actionName]["errors"]) {
                actions[apiPath][methodType][actionName]["errors"] = {};
              }
              if (!actions[apiPath][methodType][actionName]["errors"][status]) {
                actions[apiPath][methodType][actionName]["errors"][status] = [];
              }
              actions[apiPath][methodType][actionName]["errors"][status].push({
                message: processedResponse,
              });
              addedResponses.add(JSON.stringify(processedResponse));
            }
            return;
          }
          // if it's a return statement with an expression, skip it

          if (
            (expression && Node.isCallExpression(expression)) ||
            Node.isNewExpression(expression)
          ) {
            ({ status, resultsDeclaration } = process_call_expression(
              expression,
              resultsDeclaration,
              spinner
            ));
          } else if (expression && Node.isIdentifier(expression)) {
            resultsDeclaration = processReturnIdentifier(
              expression,
              resultsDeclaration
            );
          } else if (expression && Node.isObjectLiteralExpression(expression)) {
            resultsDeclaration = expression;
          } else {
            log.warn(
              3,
              `Unhandled return statement with type (${expression.getKindName()}), in ${subnode
                .getSourceFile()
                .getFilePath()}\n		please report this to the developer\n	------\n		${subnode.getText()}\n		------\n`
            );
          }
        } else if (
          Node.isVariableDeclaration(subnode) &&
          subnode.getName() === "results"
        ) {
          resultsDeclaration = processReturnVariable(
            resultsDeclaration,
            subnode
          );
        }

        if (!actions[apiPath][methodType][actionName]["responses"][status]) {
          actions[apiPath][methodType][actionName]["responses"][status] = [];
        }

        if (resultsDeclaration) {
          const processedResponse = processTypeNode(resultsDeclaration);
          if (!addedResponses.has(JSON.stringify(processedResponse))) {
            actions[apiPath][methodType][actionName]["responses"][status].push(
              processedResponse
            );
            addedResponses.add(JSON.stringify(processedResponse));
          }
        }
      }
    }
  });
}

function ms_to_human_readable(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

async function processFiles(spinner: Ora) {
  const start = performance.now();
  const all_files = project.getSourceFiles();
  spinner.text = "Scanning for API endpoints...";
  spinner.info(
    `Found ${all_files.length} files in ${ms_to_human_readable(
      performance.now() - start
    )}`
  );
  spinner.info(`Generating API types for ${input} in ${outputPath}`);

  const processedFiles = new Set<string>();
  const valid_files = new Set<string>();

  await Promise.all(
    all_files.map(async (file) => {
      const filePath = file.getFilePath();
      if (processedFiles.has(filePath)) {
        return;
      }
      processedFiles.add(filePath);

      const valid_declarations = Array.from(
        file.getExportedDeclarations().values()
      )
        .flat()
        .filter(
          (d) =>
            (Node.isFunctionDeclaration(d) ||
              Node.isVariableDeclaration(d) ||
              Node.isTypeAliasDeclaration(d)) &&
            [
              "GET",
              "POST",
              "PUT",
              "PATCH",
              "DELETE",
              "_Get",
              "_Post",
              "_Put",
              "_Patch",
              "_Delete",
              "actions",
            ].includes(d.getName() || "")
        ) as (
        | FunctionDeclaration
        | VariableDeclaration
        | TypeAliasDeclaration
      )[];

      const processed_declarations = new Set<string>();
      const declaration_processing_promises = [];
      for (const declaration of valid_declarations) {
        const hash = hashNode(declaration);
        if (processed_declarations.has(hash)) {
          continue;
        }
        processed_declarations.add(hash);
        declaration_processing_promises.push(
          process_file_declarations(file, declaration)
        );
      }
      await Promise.all(declaration_processing_promises);
      valid_files.add(filePath);
    })
  );
  const end = performance.now();
  spinner.succeed(
    `Processed ${all_files.length} files in ${ms_to_human_readable(
      end - start
    )}`
  );
  return valid_files.size;
}

async function process_file_declarations(
  file: SourceFile,
  declaration: FunctionDeclaration | VariableDeclaration | TypeAliasDeclaration
) {
  const declarationName = declaration.getName() as string;
  const declaration_spinner = ora({
    text: `${declarationName}`,
    color: "yellow",
    indent: 3,
  })
    .start()
    .info(
      `${ansiColors.bgGreen(declarationName)} | ${node_location_and_line(
        declaration
      )}`
    );

  const promises = [];

  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(declarationName)) {
    promises.push(
      processFunctionDeclaration(
        declaration as FunctionDeclaration | VariableDeclaration
      )
    );
  } else if (
    ["_Get", "_Post", "_Put", "_Patch", "_Delete"].includes(declarationName)
  ) {
    promises.push(
      processTypeDeclaration(
        declaration as TypeAliasDeclaration,
        declaration_spinner
      )
    );
  } else if (declarationName === "actions") {
    promises.push(
      processActionsDeclaration(
        declaration as TypeAliasDeclaration,
        declaration_spinner
      )
    );
  }

  await Promise.all(promises);
}

async function generateApiTypes() {
  const spinner = ora("Processing API types...").start();
  const imports = new Set<string>();
  let output = "";

  // Create a type for each HTTP method
  const methodTypes: Partial<Record<HTTP_METHOD, string>> = {
    GET: "",
    POST: "",
    PUT: "",
    DELETE: "",
    PATCH: "",
  };

  // Keep track of which methods have endpoints
  const methodsWithEndpoints = new Set<HTTP_METHOD>();

  for (const [apiPath, methodMap] of endpoints) {
    for (const [method, endpointDef] of methodMap) {
      if (!methodTypes[method]) {
        methodTypes[method] = `export interface ${method} {\n`;
      }
      methodsWithEndpoints.add(method);

      methodTypes[method] += `  '${apiPath}': {\n`;

      if (endpointDef.docs) {
        methodTypes[method] += `    ${endpointDef.docs}\n`;
      }

      methodTypes[method] += `    parameters: ${generateParametersType(
        endpointDef.parameters
      )};\n`;

      if (endpointDef.parameters?.body?.imports) {
        for (const imp of endpointDef.parameters.body.imports) {
          imports.add(imp);
        }
      }

      if (endpointDef.imports) {
        for (const imp of endpointDef.imports) {
          imports.add(imp);
        }
      }

      if (endpointDef.responses) {
        for (const [status, responses] of Object.entries(
          endpointDef.responses
        )) {
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
          endpointDef.responses
            ? generateResponsesType(endpointDef.responses)
            : "never"
        };\n`;
      }

      if (endpointDef.errors && Object.keys(endpointDef.errors).length > 0) {
        methodTypes[method] += `    errors: ${newline(
          brackets(
            (() => {
              let output = "";
              for (const [status, responses] of Object.entries(
                endpointDef.errors
              )) {
                output += `      ${status}: `;
                for (const response of responses) {
                  if (response.imports) {
                    for (const imp of response.imports) {
                      imports.add(imp);
                    }
                  }
                }
                output += `${Array.from(responses.values())
                  .map((response) => response.typeString || "any")
                  .join(" | ")};`;
              }
              return output;
            })()
          )
        )}`;
      } else {
        methodTypes[method] += "    errors?: never;\n";
      }

      methodTypes[method] += "  };\n";
    }
  }

  // Combine all method types
  for (const [method, methodType] of Object.entries(methodTypes)) {
    if (methodsWithEndpoints.has(method as HTTP_METHOD)) {
      output += `${methodType}}\n\n`;
    } else {
      output += `export type ${method} = object;\n\n`;
    }
  }

  // Create a union type of all HTTP method interfaces
  const apiPathsUnion = Object.keys(methodTypes)
    .map((method) => `${method}`)
    .join(" & ");
  output += `export type APIPaths = ${apiPathsUnion};\n`;

  const importsString = Array.from(imports).join("\n");

  spinner.succeed("Processed API types");
  return `${importsString}\n\n${output}`;
}

function objectToUnquotedString(obj: unknown): string {
  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }

  // handle arrays
  if (Array.isArray(obj)) {
    return `[${obj.map(formatObject).join(", ")}]`;
  }

  const pairs = Object.entries(obj).map(([key, value]) => {
    return `${key}:${objectToUnquotedString(value)}`;
  });

  return `{${pairs.join(",")}}`;
}

const generateParametersType = (
  parameters?: EndpointDefinition["parameters"]
): string => {
  if (!parameters) {
    return "undefined";
  }

  return brackets(
    (() => {
      let output = "";
      if (parameters.body) {
        output += `        body: ${parameters.body.typeString?.replaceAll(
          `${workingDir}/`,
          ""
        )};\n`;
      }
      if (parameters.path) {
        const path_params_string = entries(parameters.path)
          .map(([key, value]) => `${String(key)}: ${value}`)
          .join("\n");

        output += `        path${
          Object.keys(parameters.path).length === 0 ? "?" : ""
        }: ${
          Object.keys(parameters.path).length > 0
            ? brackets(path_params_string)
            : "never"
        };\n`;
      }
      if (parameters.query) {
        const query_parameters: string[] = [];
        for (const [param, type] of Object.entries(parameters.query)) {
          query_parameters.push(`    ${param}: ${type.typeString};`);
        }
        output += `        query${
		  Object.keys(parameters.query).length === 0 ? "?" : ""
		}: ${brackets(Object.keys(parameters.query).length > 0 ? query_parameters.join("\n") : "never")};\n`;
      }
      return output;
    })()
  );
};

const generateResponsesType = (
  responses?: Partial<Record<number, FormattedType[]>>
): string => {
  if (!responses) {
    return "undefined";
  }
  const responseTypes: string[] = [];
  for (const [status, responseArray] of Object.entries(responses)) {
    const types = responseArray
      ?.map((response) => response.typeString || "any")
      .join(" | ");

    responseTypes.push(`    ${status}: ${types}`);
  }
  return brackets(responseTypes.join("\n"));
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function formatObject(obj: any): string {
  if (!obj) {
    return "undefined";
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(formatObject).join(", ")}]`;
  }
  if (typeof obj === "string") {
    return /^\{\s*\}$/.test(obj) ? "never" : obj;
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return "never";
    }
    return brackets(
      entries
        .map(([key, value]) => `${String(key)}: ${formatObject(value)},`)
        .join("\n")
    );
  }
  return obj;
}

async function generateActionsOutput(): Promise<string> {
  return;
  let actionOutput = "";

  for (const [apiPath, action] of entries(actions)) {
    actionOutput += `  '${apiPath}': {
		${entries(action)
      .map(
        ([method, methodActions]) => `
			${method}: {
				${entries(methodActions)
          .map(
            ([action, actionData]) => `
					parameters: ${brackets(
            entries(actionData.parameters)
              .map(([paramType, paramValue]) => {
                const formattedValue = formatObject(paramValue);
                const optional = formattedValue === "never" ? "?" : "";
                return `${String(paramType)}${optional}: ${formattedValue},`;
              })
              .join("\n")
          )}
					responses: ${brackets(
            entries(actionData.responses)
              .filter(([, response]) => formatObject(response).trim() !== "")
              .map(
                ([statusCode, response]) =>
                  `${Number(statusCode)}: ${formatObject(response)},`
              )
              .join("\n")
          )}
					errors: ${brackets(
            entries(actionData.errors)
              .map(
                ([statusCode, response]) =>
                  `${Number(statusCode)}: ${formatObject(response)},`
              )
              .join("\n")
          )}
				`
          )
          .join(",\n")}
			}`
      )
      .join(",\n")}
	}`;
  }

  return `export interface ActionPaths ${brackets(actionOutput)}`;
}

// let jsonSchema: TJS.Definition | null = null;

async function sendTelemetry() {
  if (telemetry === false) {
    return;
  }

  // read previous telemetry if it exists
  if (fs.existsSync(path.join(__dirname, "telemetry.json"))) {
    const previousTelemetry = JSON.parse(
      fs.readFileSync(path.join(__dirname, "telemetry.json")).toString()
    );

    // if the previous telemetry was sent less than 24 hours ago, don't send it again
    if (Date.now() - previousTelemetry.timestamp < 1000 * 60 * 60 * 24) {
      return;
    }

    // if the number of lines of code is the same as the previous telemetry, don't send it again
    if (
      previousTelemetry.data.generated_lines_of_code ===
      telemetryPayload.data.generated_lines_of_code
    ) {
      return;
    }
  }

  // write telemetry locally
  fs.writeFileSync(
    path.join(__dirname, "telemetry.json"),
    JSON.stringify(telemetryPayload)
  );

  // send telemetry to svetch server
  const url = "https://svetch-dev.vercel.app/telemetry";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(telemetryPayload),
  });

  if (response.status === 200) {
    log.debug(
      1,
      `Telemetry sent successfully, it contains only statistics, if you don't want it, you can set telemetry to false in your .svetchrc file`
    );
  }
}

// async function generateSchema() {
// 	const start = performance.now();
// 	const spinner = ora("Generating API JSON schema...").start();
// 	// optionally pass argument to schema generator
// 	const settings: TJS.PartialArgs = {
// 		// required: true,
// 		ignoreErrors: true,
// 		aliasRef: true,
// 		// topRef: true,
// 	};

// 	// optionally pass ts compiler options
// 	// const compilerOptions: TJS.CompilerOptions = {
// 	// strictNullChecks: true,
// 	// };

// 	// optionally pass a base path
// 	// const basePath = "./my-dir";

// 	const program = TJS.getProgramFromFiles(
// 		[path.resolve(`${out}/api.ts`)],
// 		// compilerOptions,
// 		// basePath
// 	);

// 	// write to disk
// 	// fs.writeFileSync(
// 	// 	path.join(staticFolder, "api", "schemas", "openapi.json"),
// 	// 	JSON.stringify(openapi_schema, null, 2),
// 	// );

// 	// generate schema for

// 	const schemas: Record<string, TJS.Definition> = {};

// 	for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
// 		// We can either get the schema for one file and one type...
// 		const schema = TJS.generateSchema(program, method, settings);
// 		if (schema) {
// 			schemas[method] = schema;
// 		}

// 		jsonSchema = schema;

// 		spinner.text = "Writing JSON Schema";
// 		// ensure schema path is there
// 		if (!fs.existsSync(schemaOutputPath)) {
// 			fs.mkdirSync(schemaOutputPath, { recursive: true });
// 		}

// 		await Promise.all([
// 			fs.promises.writeFile(
// 				path.join(outputPath, `${method}.json`),
// 				JSON.stringify(schema, null, 2),
// 			),

// 			fs.promises.writeFile(
// 				path.join(schemaOutputPath, `${method}.json`),
// 				JSON.stringify(schema),
// 			),
// 		]);
// 	}

// 	spinner.succeed(
// 		`Generated API JSON schema successfully, ${ms_to_human_readable(
// 			performance.now() - start,
// 		)}`,
// 	);
// }

// async function generateZodSchema() {
// 	const schema = parseSchema(jsonSchema as any);

// 	const output = `import { z } from 'zod';\n\nexport const schema = ${schema};`;

// 	telemetryPayload.data.generated_lines_of_code += output.split("\n").length;

// 	//   write
// 	fs.writeFileSync(path.join(outputPath, "zod.ts"), output);
// 	log.success(2, `Generated zod schema in ${path.join(outputPath, "zod.ts")}`);
// }

function generateSvetchDocs() {
  const static_folder = path.join(workingDir, staticFolder);
  const docs = fs
    .readFileSync(path.join(__dirname, "./assets/docs/+page.svelte"))
    .toString()
    .replace("[STATIC_FOLDER]", static_folder);

  // get all components inside the assets/docs/components folder
  // create the folders
  if (!fs.existsSync(docsOutputPath)) {
    fs.mkdirSync(docsOutputPath, { recursive: true });
  }
  if (!fs.existsSync(path.join(docsOutputPath, "components"))) {
    fs.mkdirSync(path.join(docsOutputPath, "components"), { recursive: true });
  }

  // write
  fs.writeFileSync(path.join(docsOutputPath, "+page.svelte"), docs);
}

function generateImports(importMap: Record<string, string>): string {
  return Object.entries(importMap)
    .filter(
      ([importName, moduleName]) =>
        moduleName !== "./$types" &&
        !["Post", "Get", "Put", "Patch", "Delete"].includes(importName)
    )
    .map(
      ([importName, moduleName]) =>
        `import { ${importName} } from "${moduleName}";`
    )
    .join("\n");
}

function generateApiOutput(
  importsOutput: string,
  interfaces: string,
  output: string,
  actionsOutput: string
): string {
  return `${importsOutput}\n${interfaces}\n${output}\n${actionsOutput}`;
}

async function generateClientOutput(client: string) {
  const imports = new Set();
  if (fs.existsSync(path.join(outputPath, "zod.ts"))) {
    imports.add('import { schema } from "./zod.js"');
  }

  const client_output = `${Array.from(imports).join("\n")}\n${client}`;
  await fs.promises.writeFile(
    path.join(outputPath, "client.ts"),
    client_output,
    {
      encoding: "utf-8",
    }
  );
}

async function generateAll() {
  const spinner = ora("Generating API components...").start();
  const start = performance.now();

  const [apiTypes, actionsOutput, interfaces, client] = await Promise.all([
    generateApiTypes(),
    generateActionsOutput(),
    fs.promises.readFile(
      path.resolve(__dirname, "./assets/interfaces.ts"),
      "utf-8"
    ),
    fs.promises.readFile(
      path.resolve(__dirname, "./assets/client.ts"),
      "utf-8"
    ),
  ]);

  try {
    const importsOutput = generateImports(importMap);

    spinner.info(
      `Generating API Types..., ${ms_to_human_readable(
        performance.now() - start
      )}`
    );
    const apiOutput = generateApiOutput(
      importsOutput,
      interfaces,
      apiTypes,
      actionsOutput
    );

    spinner.info(
      `Writing files to ${outputPath}, ${ms_to_human_readable(
        performance.now() - start
      )}`
    );

    await Promise.allSettled([
      fs.promises.writeFile(path.join(outputPath, "api.ts"), apiOutput, {
        encoding: "utf-8",
      }),
      generateSvetchDocs(),
    ]).then(async () => {
      try {
        await generate_tsoa_shema(endpoints, staticFolder);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("model definitions for model")
        ) {
          spinner.warn(
            ansiColors.red(
              "All types must have UNIQUE names, please annotate your type using JSDoc, using the @tsoaModel tag to resolve this, more details https://tsoa-community.github.io/docs/faq.html#dealing-with-duplicate-model-names"
            )
          );
          console.error(error.message);
        }
        // spinner.warn(
        // 	`Error generating schema, please report this to the developer: ${error}`,
        // );
      }
      spinner.info(
        `Generating Client..., ${ms_to_human_readable(
          performance.now() - start
        )}`
      );
      await generateClientOutput(client);
    });

    spinner.succeed(
      `Generated API components successfully, ${ms_to_human_readable(
        performance.now() - start
      )}`
    );
  } catch (error) {
    spinner.fail(
      `Error generating schema, please report this to the developer: ${error}`
    );
  }
}

export async function main(args: ScriptArgs) {
  tsconfig = args.tsconfig;
  framework = args.framework;
  input = args.input;
  out = args.out;
  logLevel = args.logLevel;
  filter = args.filter;
  docs = args.docs;
  staticFolder = args.staticFolder;
  telemetry = args.telemetry;

  project = new Project({
    compilerOptions: { allowJs: true },
    tsConfigFilePath: tsconfig,
    skipAddingFilesFromTsConfig: true,
  });
  typeChecker = project.getTypeChecker();

  const spinner = ora("Scanning for API endpoints...").start();

  project.addSourceFilesAtPaths([`${input}/**/*+server.ts`]);
  project.resolveSourceFileDependencies();

  // Change output path here:
  outputPath = path.join(workingDir, out);
  schemaOutputPath = path.join(workingDir, staticFolder, "api", "schemas");
  docsOutputPath = path.join(workingDir, docs);

  // check if input folder exists

  if (!fs.existsSync(input)) {
    spinner.fail(
      `Input folder ${input} does not exist. Please change it in your .svetchrc file here: 👉 [${path.resolve(
        workingDir,
        ".svetchrc"
      )}]\nOr run svetch init again.\n\nExiting...\n\n`
    );
    process.exit(1);
  }
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  const processed_files = await processFiles(spinner);
  await generateAll();

  try {
    sendTelemetry();
  } catch (error) {}

  spinner.succeed(`Done!, now import Svetch using the following code:\n\n 
  import { Svetch } from ${path
    .join(workingDir, out, "client")
    .replace(workingDir, "")
    .slice(1)};
      
  const svetch = new Svetch();\n\n`);

  if (processed_files > 10) {
    spinner.info(`💖 Did svetch help you? If it has saved you time,
  please consider supporting the project by purchasing a license here:
  https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d
  
  Any feedback or issues, please report them here 👉 https://github.com/Bewinxed/svetch/`);
  }
}
