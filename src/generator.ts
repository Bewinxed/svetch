import * as commentParser from "comment-parser";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
  type CallExpression,
  type CallLikeExpression,
  type CatchClause,
  type ExportedDeclarations,
  FunctionDeclaration,
  type Identifier,
  type ImportDeclaration,
  type NewExpression,
  Node,
  type ObjectLiteralExpression,
  Project,
  type PropertyAssignment,
  ReturnStatement,
  type SourceFile,
  SyntaxKind,
  ts,
  type TypeAliasDeclaration,
  type TypeChecker,
  type TypeNode,
  type TypeReferenceNode,
  type VariableDeclaration,
  type VariableStatement,
} from "ts-morph";
import * as TJS from "typescript-json-schema";
import type {
  EndpointDefinition,
  FormattedType,
  HTTP_METHOD,
  ScriptArgs,
} from "./types/core.js";

import ansiColors from "ansi-colors";
import { Presets, SingleBar } from "cli-progress";
import { fileURLToPath } from "node:url";
import ora, { oraPromise, type Ora } from "ora";
import { footprintOfType } from "./svelte-codegen.js";
import type { Telemetry } from "./types/telemetry.js";
import { extractPayloadTypeNode } from "./utils/endpoint_extractors.js";
import { log } from "./utils/logger.js";
import { spinner } from "./utils/ux/spinner.js";
import { inspect } from "node:util";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const workingDir = process.env.INIT_CWD || process.cwd();

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

const project = new Project({
  compilerOptions: { allowJs: true },
  tsConfigFilePath: tsconfig,
});

const typeChecker = project.getTypeChecker();

let outputPath: string;
let schemaOutputPath: string;
let docsOutputPath: string;
type MethodMap = Map<HTTP_METHOD, EndpointDefinition>;
const endpoints: Map<string, MethodMap> = new Map();
const actions: Record<string, Record<string, any>> = {};
const importMap = {};

function processTypeNode(node: TypeNode): FormattedType {
  const memoized = new WeakMap<TypeNode, FormattedType>();

  function processInner(innerNode: TypeNode): FormattedType {
    if (memoized.has(innerNode)) {
      return memoized.get(innerNode) as FormattedType;
    }

    let result: FormattedType;
    if (
      Node.isTypeReference(innerNode) ||
      Node.hasStructure(innerNode)
      // typeText.includes('Prisma')
    ) {
      result = footprintOfType({
        file: innerNode.getSourceFile(),
        type: innerNode.getType(),
        node: innerNode,
        typeChecker: typeChecker,
      });
    } else if (Node.isObjectLiteralExpression(innerNode)) {
      const processedObject = processObjectLiteral(
        innerNode as ObjectLiteralExpression
      );
      result = { typeString: processedObject, imports: new Set() };
    } else {
      result = { typeString: innerNode.getText(), imports: new Set() };
    }

    memoized.set(innerNode, result);
    return result;
  }

  return processInner(node);
}

function processObjectLiteral(node: ObjectLiteralExpression): string {
  let inferredTypes: Record<string, any> = {};

  for (const property of node.getProperties()) {
    if (Node.isPropertyAssignment(property)) {
      const initializer = property.getInitializer();
      const keyname = getPropertyKeyName(property);

      if (!initializer || !keyname) continue;

      inferredTypes[keyname] = getPropertyType(property, initializer, node);
    }
  }

  return JSON.stringify(inferredTypes);
}

function getPropertyKeyName(property: PropertyAssignment): string | undefined {
  try {
    const computedName = property.getFirstChildByKind(
      SyntaxKind.ComputedPropertyName
    );
    if (computedName) {
      const identifier = computedName.getFirstChildByKind(
        SyntaxKind.Identifier
      );
      return `${identifier?.getText()}: string`;
    }
    return property.getName();
  } catch (e) {
    console.error("Error getting property name:", e);
    return property.getName();
  }
}

function getPropertyType(
  property: PropertyAssignment,
  initializer: Node,
  node: Node
): string {
  if (
    apiParams[node.getSourceFile().getFilePath()] &&
    apiParams[node.getSourceFile().getFilePath()]
      .getText()
      .includes(initializer?.getText().replace("params.", ""))
  ) {
    return "string";
  }

  if (Node.isPropertyAccessExpression(initializer)) {
    return typeChecker.getTypeAtLocation(property).getText() || "any";
  }

  return typeChecker.getTypeAtLocation(initializer)?.getText() || "any";
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

  let searchParamsVariables = new Set<string>();

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
              file: node.getSourceFile(),
              type: typeChecker.getTypeAtLocation(node),
              node: node,
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

function extractCatchThrowDetails(
  node: Node
): { status: string; message: string; type: string } | null {
  if (Node.isCatchClause(node)) {
    // log types of all children
    const throwBlock = node.getFirstChildByKind(SyntaxKind.Block);
    if (!throwBlock) {
      return null;
    }
    const throwStatement = throwBlock.getFirstChildByKind(
      SyntaxKind.ThrowStatement
    );
    if (throwStatement) {
      const callExpression = throwStatement.getFirstChildByKind(
        SyntaxKind.CallExpression
      );
      if (callExpression && Node.isCallExpression(callExpression)) {
        const args = callExpression.getArguments();
        if (
          args.length >= 2 &&
          Node.isNumericLiteral(args[0]) &&
          Node.isTemplateExpression(args[1])
        ) {
          let type = "unknown";
          const catchClause = node as CatchClause;
          const errorVariableDeclaration = catchClause.getVariableDeclaration();
          if (errorVariableDeclaration) {
            const errorVariableType = errorVariableDeclaration.getType();
            if (errorVariableType) {
              type = errorVariableType.getText();
            }
          }
          return {
            status: args[0].getText(),
            message: args[1].getText().replace("${e}", type),
            type,
          };
        }
      }
    }
  }
  if (Node.isThrowStatement(node)) {
    const callExpression = node.getFirstChildByKind(SyntaxKind.CallExpression);
    if (callExpression && Node.isCallExpression(callExpression)) {
      const args = callExpression.getArguments();
      if (
        args.length >= 2 &&
        Node.isNumericLiteral(args[0]) &&
        Node.isStringLiteral(args[1])
      ) {
        const statusCode = args[0].getText();
        const message = args[1].getText();

        return {
          status: statusCode,
          message,
          type: "unknown",
        };
      }
    }
  }

  return null;
}

const apiParams: Record<string, TypeNode> = {};

function extractRootDirTypes(
  declaration: FunctionDeclaration | VariableDeclaration
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
        `No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed`
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

function processFunctionDeclaration(
  declaration: FunctionDeclaration | VariableDeclaration,
  spinner: Ora
): void {
  const file = declaration.getSourceFile();
  const methodType = declaration.getName() as HTTP_METHOD;

  const filePath = file.getFilePath();
  const apiPath = processFilePath(filePath);

  const endpoint =
    endpoints.get(apiPath) ||
    (endpoints.set(apiPath, new Map()).get(apiPath) as MethodMap);

  spinner.text = ` | ${methodType}`;

  const allDeclarations = getAllDeclarations(declaration);
  // log all declaration names
  if (!allDeclarations?.length) {
    spinner.fail("No declarations found");
    return;
  }

  if (framework === "sveltekit") {
    extractRootDirTypes(declaration);
  }

  const payloadNode = extractPayloadTypeNode(allDeclarations);
  payloadNode
    ? spinner.info("Detected request body")
    : spinner.warn(
        `No request body declaration found for ${methodType} method in ${filePath}`
      );

  const jsdoc = extractJSDoc(declaration);

  const method =
    endpoint.get(methodType) ||
    (endpoint.set(methodType, {}).get(methodType) as EndpointDefinition);

  method.parameters = {
    path: extractPathParams(apiPath),
    query: extractQueryParameters(declaration, method, typeChecker),
    body: payloadNode ? processTypeNode(payloadNode) : undefined,
  };
  method.docs = jsdoc[0]?.[0]
    ? commentParser.stringify(jsdoc[0][0])
    : undefined;

  const { resultsDeclaration } = processDeclarations(
    allDeclarations,
    method,
    spinner
  );

  if (!resultsDeclaration) {
    spinner.warn(
      `No response body found for ${methodType} method in ${filePath}, (Declare this using const results = {...}, new Response(...), or json(...))`
    );
  }

  if (["POST", "PUT", "PATCH"].includes(methodType) && !payloadNode) {
    spinner.warn(
      `No payload declaration found for ${methodType} method in ${filePath}, (Declare this using const payload = {...} as TYPE`
    );
  }
}

// Helper functions

function processFilePath(filePath: string): string {
  return filePath
    .replace(workingDir, "")
    .replace("/src/routes", "")
    .replace("/+server.ts", "")
    .replace("/", "")
    .replace(/\[([^\]]+)\]/g, ":$1");
}

function getAllDeclarations(
  declaration: FunctionDeclaration | VariableDeclaration
) {
  return declaration instanceof FunctionDeclaration
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

function processDeclarations(
  allDeclarations: Node[],
  method: EndpointDefinition,
  spinner: Ora
): { status: number; resultsDeclaration?: TypeReferenceNode } {
  let status = 200;
  let resultsDeclaration: TypeReferenceNode | undefined;

  for (const node of allDeclarations) {
    if (Node.isReturnStatement(node)) {
      const result = processReturnStatement(
        node,
        status,
        resultsDeclaration,
        spinner
      );
      if (result) {
        ({ status, resultsDeclaration } = result);
      }
    } else if (
      Node.isVariableDeclaration(node) &&
      node.getName() === "results"
    ) {
      resultsDeclaration = processReturnVariable(resultsDeclaration, node);
    }

    processThrowDetails(node, method);
  }

  if (resultsDeclaration) {
    const processedResponse = processTypeNode(resultsDeclaration);
    method.responses ??= {};
    method.responses[status] ??= [];
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    method.responses[status]!.push(processedResponse);
  }

  return { status, resultsDeclaration };
}

function node_text_snippet(node: Node) {
  const text = node.getText();
  const start = Math.max(0, text.lastIndexOf("\n", 100));
  const end = Math.min(text.length, text.indexOf("\n", 100));
  return text.slice(start, end);
}

function processReturnStatement(
  node: ReturnStatement,
  status: number,
  resultsDeclaration: TypeReferenceNode | undefined,
  spinner: Ora
) {
  const expression = node.getExpression();
  if (!expression) {
    spinner.warn(
      `Detected return statement without expression ${node_text_snippet(node)}`
    );
    return null;
  }

  if (
    !node.getText().includes("json") &&
    !node.getText().includes("Response")
  ) {
    spinner.warn(
      `Detected return statement (${node_text_snippet(
        expression
      )}) without json() or new Response() constructor, Skipping...`
    );
    return null;
  }

  if (Node.isCallExpression(expression) || Node.isNewExpression(expression)) {
    return processReturnExpression(
      expression,
      status,
      resultsDeclaration,
      spinner
    );
  }
  if (Node.isIdentifier(expression)) {
    return {
      status,
      resultsDeclaration: processReturnIdentifier(
        expression,
        resultsDeclaration
      ),
    };
  }
  spinner.warn(
    `Unhandled return statement with type (${expression.getKindName()}), in ${node
      .getSourceFile()
      .getFilePath()}\n\t\tplease report this to the developer\n\t------\n\t\t${node.getText()}\n\t\t------\n`
  );
  return null;
}

function processThrowDetails(node: Node, method: EndpointDefinition) {
  const throwDetails = extractCatchThrowDetails(node);
  if (throwDetails) {
    if (!method.errors) {
      method.errors = {};
    }
    if (!method.errors[throwDetails.status]) {
      method.errors[throwDetails.status] = [];
    }
    method.errors[throwDetails.status].push({
      message: throwDetails.message,
    });
  }
}

function processReturnVariable(
  resultsDeclaration: TypeReferenceNode | undefined,
  node: VariableDeclaration
) {
  resultsDeclaration = node.getTypeNode() as TypeReferenceNode;
  if (!resultsDeclaration) {
    const initializer = node.getInitializer();
    if (initializer) {
      let expression = initializer;

      // if the initializer is an await expression, get its expression
      if (Node.isAwaitExpression(initializer)) {
        expression = initializer.getExpression();
      }

      if (Node.isCallExpression(expression)) {
        // get the function
        const functionExpression = expression.getExpression();
        // log it
        log.debug(4, `function`, functionExpression.getText());
        // log the return type
        log.debug(4, `return type`, functionExpression.getType().getText());
        // get the type of the initializer
        const type = expression.getReturnType();
        // print the type
        log.debug(4, `return type`, type.getText());
      }
    }
  }
  return resultsDeclaration;
}

function processReturnIdentifier(
  expression: Identifier,
  resultsDeclaration: TypeReferenceNode | undefined
) {
  log.success(
    3,
    `Detected return statement with identifier expression:\n		---\n		${expression?.getText()}\n		---\n`
  );
  const symbol = typeChecker.getSymbolAtLocation(expression);
  if (symbol) {
    const declarations = symbol.getDeclarations();
    if (declarations) {
      resultsDeclaration = declarations[0] as TypeReferenceNode;
    }
  }
  return resultsDeclaration;
}

function processFailExpression(
  expression: CallExpression,
  status: number,
  resultsDeclaration: TypeReferenceNode | undefined
) {
  // process fail(401, {...body}), first argument is the status code, second is the body
  const args = expression.getArguments();
  if (args.length > 0) {
    const arg = args.find((arg) => arg.getKind() == SyntaxKind.NumericLiteral);
    if (arg) {
      status = parseInt(arg.getText());
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

function processReturnExpression(
  expression: CallExpression<ts.CallExpression> | NewExpression,
  status: number,
  resultsDeclaration: TypeReferenceNode | undefined,
  spinner: Ora
) {
  spinner.info(
    `Detected return statement with expression:\n		---\n		${node_text_snippet(
      expression
    )}\n		---\n`
  );
  const args = expression.getArguments();
  // get the second argument, which is the Response init object, then get the status property
  if (args.length > 1) {
    const arg = args.find(
      (arg) => arg.getKind() === SyntaxKind.ObjectLiteralExpression
    );
    if (arg) {
      spinner.warn(
        `Args: ${arg
          .getChildren()
          .map((arg) => arg.getText())
          .join(", ")}`
      );
      const statusProp = arg
        .asKind(SyntaxKind.ObjectLiteralExpression)
        ?.getProperties()
        .find(
          (child) =>
            child.getKind() === SyntaxKind.PropertyAssignment &&
            child.getText().includes("status")
        );

      if (statusProp) {
        const statusPropValue = statusProp
          .getChildren()
          .find((child) => child.getKind() === SyntaxKind.NumericLiteral);
        if (statusPropValue) {
          status = parseInt(statusPropValue.getText());
        }
      }
    }
  }

  if (args.length > 0) {
    const arg = args.at(0);
    if (arg?.getKind() === SyntaxKind.Identifier) {
      const symbol = typeChecker.getSymbolAtLocation(arg);
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations) {
          resultsDeclaration = declarations[0] as TypeReferenceNode;
          if (
            declarations
              .at(0)
              ?.getFirstDescendantByKind(SyntaxKind.MethodDeclaration)
          ) {
            log.error(
              3,
              `Found method declaration, These are unsupported at the moment, but you can report it in github, ${declarations[0].getText()}`
            );
            // process.exit()
            // set as unknown type
            return {
              status,
              resultsDeclaration: undefined,
            };
          }
          spinner.info(
            `Found (results = ) declaration: ${node_text_snippet(arg)}`
          );
        }
      }
    } else if (arg?.getKind() === SyntaxKind.ObjectLiteralExpression) {
      spinner.info(
        `Found Object results declaration:', ${node_text_snippet(arg)}`
      );
      resultsDeclaration = arg as TypeReferenceNode;
    } else {
      if (arg?.getFirstDescendantByKind(SyntaxKind.MethodDeclaration)) {
        spinner.warn(
          `Found method declaration, These are unsupported at the moment, but you can report it in github, ${node_text_snippet(
            arg
          )}`
        );
        return {
          status,
          resultsDeclaration: undefined,
        };
      }
      resultsDeclaration = arg as TypeReferenceNode;
      spinner.fail(
        `Unhandled return statement, please report this to the developer, ${node_text_snippet(
          arg
        )}, of type ${arg?.getKindName()}`
      );
    }
  }
  return { status, resultsDeclaration };
}

function processTypeDeclaration(
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

function processActionsDeclaration(
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

  const typeNode = declaration.getTypeNodeOrThrow();

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
            ({ status, resultsDeclaration } = processReturnExpression(
              expression,
              status,
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

function absolute_to_relative(path: string) {
  return path.replace(workingDir, "");
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

async function processFiles() {
  const start = performance.now();
  const spinner = ora("Finding files...").start();
  const all_files = project.getSourceFiles();
  spinner.succeed(
    `Found ${all_files.length} files in ${ms_to_human_readable(
      performance.now() - start
    )}`
  );

  spinner.info(`Generating API types for ${input} in ${outputPath}`);

  // const progressBar = new SingleBar({}, Presets.shades_classic);
  // progressBar.start(all_files.length, 0);

  const processedFiles = new Set<string>();

  await Promise.all(
    all_files.map(async (file) => {
      const filePath = file.getFilePath();
      if (processedFiles.has(filePath)) return;
      processedFiles.add(filePath);

      const validDeclarations = Array.from(
        file.getExportedDeclarations().values()
      )
        .flat()
        .map(isValidDeclaration)
        .filter((v) => !!v);

      for (const declaration of validDeclarations) {
        await processDeclaration(file, declaration);
      }

      // progressBar.increment();
    })
  );

  // progressBar.stop();
  const end = performance.now();
  spinner.succeed(
    `Processed ${all_files.length} files in ${ms_to_human_readable(
      end - start
    )}`
  );
}

function isValidDeclaration(declaration: ExportedDeclarations) {
  const validNames = new Set([
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
  ]);

  let name: string | undefined;

  if (Node.isFunctionDeclaration(declaration)) {
    name = declaration.getName();
    if (name && validNames.has(name)) {
      return declaration;
    }
  } else if (Node.isVariableDeclaration(declaration)) {
    name = declaration.getName();
    if (name && validNames.has(name)) {
      return declaration;
    }
  } else if (Node.isTypeAliasDeclaration(declaration)) {
    name = declaration.getName();
    if (name && validNames.has(name)) {
      return declaration;
    }
  }
  return;
}

async function processDeclaration(
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
      `${ansiColors.bgGreen(declarationName)} | ${absolute_to_relative(
        file.getFilePath()
      )}`
    );

  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(declarationName)) {
    processFunctionDeclaration(
      declaration as FunctionDeclaration | VariableDeclaration,
      declaration_spinner
    );
  } else if (
    ["_Get", "_Post", "_Put", "_Patch", "_Delete"].includes(declarationName)
  ) {
    processTypeDeclaration(
      declaration as TypeAliasDeclaration,
      declaration_spinner
    );
  } else if (declarationName === "actions") {
    processActionsDeclaration(
      declaration as TypeAliasDeclaration,
      declaration_spinner
    );
  }
}

async function generateApiTypes() {
  const spinner = ora("Processing API types...").start();
  const imports = new Set<string>();
  let output = "export interface APIPaths {\n";

  for (const [apiPath, methodMap] of endpoints) {
    const formattedPath = apiPath.replace(/^\//, "").replace(/\//g, ".");

    output += `  '${formattedPath}': {\n`;

    for (const [method, endpointDef] of methodMap) {
      if (endpointDef.docs) {
        output += `    ${endpointDef.docs}\n`;
      }

      output += `    ${method}: {\n`;
      output += `      parameters: ${generateParametersType(
        endpointDef.parameters
      )},\n`;

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
        output += `      responses: ${
          endpointDef.responses
            ? generateResponsesType(endpointDef.responses)
            : "never"
        };\n`;
      }

      if (endpointDef.errors && Object.keys(endpointDef.errors).length > 0) {
        output += `      errors: ${generateErrorsType(endpointDef.errors)};\n`;
      } else {
        output += "      errors?: never;\n";
      }

      output += "    };\n";
    }

    output += "  };\n";
  }

  output += "}\n";

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

  return "{" + pairs.join(",") + "}";
}

const generateParametersType = (
  parameters?: EndpointDefinition["parameters"]
): string => {
  if (!parameters) return "undefined";

  let output = "{\n";

  if (parameters.body) {
    output += `        body: ${parameters.body.typeString?.replaceAll(
      `${workingDir}/`,
      ""
    )};\n`;
  }
  if (parameters.path) {
    output += `        path: ${
      parameters.path ? objectToUnquotedString(parameters.path) : "undefined"
    };\n`;
  }
  if (parameters.query) {
    output += `        query: ${
      parameters.query ? objectToUnquotedString(parameters.query) : "undefined"
    };\n`;
  }

  output += "      }";
  return output;
};

const generateResponsesType = (
  responses?: Record<number, FormattedType[]>
): string => {
  if (!responses) return "undefined";
  const responseTypes: string[] = [];
  for (const [status, responseArray] of Object.entries(responses)) {
    const types = responseArray
      .map((response) => response.typeString)
      .join(" | ");
    responseTypes.push(`    ${status}: ${types}`);
  }
  return `{\n${responseTypes.join(";\n")}\n  }`;
};

const generateErrorsType = (errors: Record<string, any[]>): string => {
  return objectToUnquotedString(errors);
};

function formatObject(obj: any): string {
  if (obj === undefined) {
    return "undefined";
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(formatObject).join(", ")}]`;
  }
  if (typeof obj === "string") {
    if (/^\{\s*\}$/.test(obj)) {
      return "never";
    }
    return `${obj}`;
  }
  if (obj == null || JSON.stringify(obj) === JSON.stringify({})) {
    return "never";
  }

  let objStr = "{\n";
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let value = formatObject(obj[key]);
      objStr += `          ${key}: ${value},\n`;
    }
  }
  objStr += "        }";
  return objStr;
}

async function generateActionsOutput(): Promise<string> {
  let actionOutput = "";

  for (const apiPath in actions) {
    actionOutput += `  '${apiPath}': {\n`;
    for (const method in actions[apiPath]) {
      actionOutput += `    ${method}: {\n`;

      for (const action in actions[apiPath][method]) {
        actionOutput += "      parameters: {\n";

        const parameters = actions[apiPath][method][action].parameters;
        for (const paramType in parameters) {
          const paramValue = await formatObject(parameters[paramType]);
          const optional = paramValue === "never" ? "?" : "";
          actionOutput += `        ${paramType}${optional}: ${paramValue},\n`;
        }
        actionOutput += "      },\n";
        actionOutput += "      responses: {\n";

        for (const statusCode in actions[apiPath][method][action].responses) {
          const response =
            actions[apiPath][method][action].responses[statusCode];
          const formattedResponse = await formatObject(response);
          if (formattedResponse.trim() === "") {
            continue;
          }
          actionOutput += `        ${statusCode}: ${formattedResponse},\n`;
        }

        actionOutput += "      },\n";
        actionOutput += "      errors: {\n";

        for (const statusCode in actions[apiPath][method][action].errors) {
          const response = actions[apiPath][method][action].errors[statusCode];
          actionOutput += `        ${statusCode}: ${await formatObject(
            response
          )},\n`;
        }

        actionOutput += "      },\n";
        actionOutput += "    },\n";
      }
    }
    actionOutput += "  },\n";
  }

  return "export interface ActionPaths {\n" + actionOutput + "};\n";
}

let jsonSchema: TJS.Definition | null = null;

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

async function generateSchema() {
  const start = performance.now();
  const spinner = ora("Generating API JSON schema...").start();
  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    // required: true,
    ignoreErrors: true,
    // topRef: true,
  };

  // optionally pass ts compiler options
  // const compilerOptions: TJS.CompilerOptions = {
  // strictNullChecks: true,
  // };

  // optionally pass a base path
  // const basePath = "./my-dir";

  const program = TJS.getProgramFromFiles(
    [path.resolve(`${out}/api.ts`)]
    // compilerOptions,
    // basePath
  );
  // We can either get the schema for one file and one type...
  const schema = TJS.generateSchema(program, "APIPaths", settings);

  jsonSchema = schema;

  spinner.text = "Writing JSON Schema";
  // ensure schema path is there
  if (!fs.existsSync(schemaOutputPath)) {
    fs.mkdirSync(schemaOutputPath);
  }

  await Promise.all([
    fs.promises.writeFile(
      path.join(outputPath, "schema.json"),
      JSON.stringify(schema, null, 2)
    ),

    fs.promises.writeFile(
      path.join(schemaOutputPath, "apiSchema.json"),
      JSON.stringify(schema)
    ),
  ]);

  spinner.succeed(
    `Generated API JSON schema successfully, ${ms_to_human_readable(
      performance.now() - start
    )}`
  );
}

// async function generateZodSchema() {
//   const schema = parseSchema(jsonSchema as any);

//   const output = `import { z } from 'zod';\n\nexport const schema = ${schema};`;

//   telemetryPayload.data.generated_lines_of_code += output.split('\n').length;

//   //   write
//   fs.writeFileSync(path.join(outputPath, 'zod.ts'), output);
//   log.success(2, `Generated zod schema in ${path.join(outputPath, 'zod.ts')}`);
// }

function generateSvetchDocs() {
  const docs = fs
    .readFileSync(path.resolve(__dirname, "./assets/docs/+page.svelte"))
    .toString()
    .replace(
      "[CLIENT_PATH]",
      path.join(workingDir, out, "client").replace(workingDir, "").slice(1)
    );
  // get all components inside the assets/docs/components folder
  const body_block = fs
    .readFileSync(
      path.resolve(__dirname, "./assets/docs/components/BodyBlock.svelte")
    )
    .toString()
    .replace(
      "[INTERFACE_PATH]",
      path.join(workingDir, out, "api").replace(workingDir, "").slice(1)
    );
  const Collapsible = fs
    .readFileSync(
      path.resolve(__dirname, "./assets/docs/components/Collapsible.svelte")
    )
    .toString();

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
  fs.writeFileSync(
    path.join(docsOutputPath, "components/BodyBlock.svelte"),
    body_block
  );
  fs.writeFileSync(
    path.join(docsOutputPath, "components/Collapsible.svelte"),
    Collapsible
  );
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

function generateClientOutput(client: string): string {
  let output = client;
  if (fs.existsSync(path.join(outputPath, "zod.ts"))) {
    output = `import { schema } from './zod'\n${client}`;
  }

  if (fs.existsSync(path.join(outputPath, "schema.json"))) {
    output = `import type { APIPaths } from './api'\n${client}`;
  }

  return output;
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
      "Generating Client..., " + ms_to_human_readable(performance.now() - start)
    );
    const clientOutput = generateClientOutput(client);
    spinner.info(
      `Writing files..., ${ms_to_human_readable(performance.now() - start)}`
    );

    await Promise.all([
      fs.promises.writeFile(path.join(outputPath, "api.ts"), apiOutput, {
        encoding: "utf-8",
      }),
      fs.promises.writeFile(path.join(outputPath, "client.ts"), clientOutput, {
        encoding: "utf-8",
      }),
      generateSchema(),
      generateSvetchDocs(),
    ]);

    spinner.succeed(
      "Generated API components successfully, " +
        ms_to_human_readable(performance.now() - start)
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

  const spinner = ora("Scanning for API endpoints...").start();
  project.addSourceFilesAtPaths([`${input}/**/*+server.ts`]);

  // Change output path here:
  outputPath = path.join(workingDir, out);
  schemaOutputPath = path.join(workingDir, staticFolder);
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
  // throw new Error('I DONT LIKE CINNABON');
  await processFiles();

  await generateAll();

  try {
    sendTelemetry();
  } catch (error) {}

  spinner.succeed(
    `\n${separator}\nDone!, now import Svetch using the following code:\n\n
    import { Svetch } from ${path
      .join(workingDir, out, "client")
      .replace(workingDir, "")
      .slice(1)};
      
      const svetch = new Svetch();\n\n`
  );

  // // if files more than 10, prompt user to purchase
  // if (totalFiles > 10) {
  //   log.info(
  //     1,
  //     `
  //     \x1b[33m⚠ Wow! You have ${totalFiles} endpoints in your project. You're certainly getting the most out of Svetch!\n
  //     By now, you must have realized the value Svetch brings to your development process - the time it saves, the consistency it provides, and the boilerplate it cuts out. It's become a crucial part of your toolkit.

  //     \x1b[37mSvetch is a labor of love, maintained and continually improved to help developers like you create amazing things with less effort. But we need your support to keep it growing and evolving.
  //     By purchasing a license, you contribute to the future development and maintenance of Svetch.

  //     Plus, with a full license, you can use Svetch with no restrictions, no matter how big your projects get!
  //   `
  //   );
  //   log.header(
  //     1,
  //     `
  //     👉 Support the development and get your license here: [https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d]

  //     Thank you for using Svetch and for your support!
  //     `
  //   );
  //   // the library will still work
  // }
}

// runAll()
