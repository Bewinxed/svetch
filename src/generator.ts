import * as commentParser from "comment-parser";

import * as fs from "fs";
import inquirer from "inquirer";
import { parseSchema } from "json-schema-to-zod";
import * as os from "os";
import * as path from "path";

import { resolve } from "path";
import {
	CallExpression,
	CatchClause,
	ExportedDeclarations,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration,
	Node,
	ObjectLiteralExpression,
	Project,
	PropertyAssignment,
	SourceFile,
	StringLiteral,
	SyntaxKind,
	TypeAliasDeclaration,
	TypeNode,
	TypeReferenceNode,
	VariableDeclaration,
	VariableStatement,
} from "ts-morph";
import type { HTTP_METHOD } from "./types/HTTP_METHODS";
import type { EndpointDefinition, FormattedType } from "./types/core";
import * as TJS from "typescript-json-schema";
import { v4 as uuidv4 } from "uuid";
import { footprintOfType } from "./svelte-codegen";

const workingDir = process.env.PWD! ?? process.cwd();

const separator = `--------------------------------------`;

// process.on('SIGUSR2', function () {
//   const snapshotFile = '/path/to/your/project/heap-' + Date.now() + '.heapsnapshot';
//   heapdump.writeSnapshot(snapshotFile, (err) => {
//     if (err) console.error(err);
//     else console.log(`Heap dump written to ${snapshotFile}`);
//   });
// });

// this won't send if you disable telemetry
let telemetryPayload: Telemetry = {
	_id: uuidv4(),
	// read from svelte.config.js
	project: workingDir.split("/").pop()!,
	timestamp: Date.now(),
	data: {
		session_id: uuidv4(),
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

interface ScriptArgs {
	framework: string;
	input: string;
	staticFolder: string;
	out: string;
	docs: string;
	tsconfig: string;
	logLevel?: number;
	filter?: string | null;
	telemetry: boolean;
}

function readSvetchrc() {
	try {
		const config = fs.readFileSync(".svetchrc", "utf8");
		return JSON.parse(config);
	} catch (error) {
		console.error("Error reading .svetchrc file:", error);
		process.exit(1);
	}
}

const defaultArgs: ScriptArgs = {
	framework: "sveltekit",
	input: "src/routes/api",
	out: "src/lib/api",
	docs: "src/routes/docs",
	staticFolder: "static",
	tsconfig: "tsconfig.json",
	logLevel: 5,
	filter: null,
	telemetry: true,
};

async function initSvetchrc() {
	// Check if the configuration file already exists

	console.log(`
  _____               _          _     
 / ____|             | |        | |    
| (___  __   __  ___ | |_   ___ | |__  
 \\___ \\ \\ \\ / / / _ \\| __| / __|| '_ \\ 
 ____) | \\ V / |  __/| |_ | (__ | | | |
|_____/   \\_/   \\___| \\__| \\___||_| |_|
                                       
Send any feedback or issues here 👉 https://github.com/Bewinxed/svetch/
`);

	console.log(
		`${separator}\nTypesafety, without the typing ;)\n${separator}\n`
	);

	if (fs.existsSync(".svetchrc")) {
		fs.renameSync(".svetchrc", ".svetchrc.backup");
		console.log("Existing .svetchrc file has been renamed to .svetchrc.backup");
	}

	// Ask for configuration options
	const responses: ScriptArgs = await inquirer.prompt([
		// {
		//   name: 'framework',
		//   message: 'What is your framework?',
		//   default: defaultArgs.framework,
		// },
		{
			name: "input",
			message: `Which folder would you like svetch to scan for API routes? - default: ${defaultArgs.input}`,
			default: defaultArgs.input,
		},
		{
			name: "out",
			message: `${separator}\nWhere would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here) - default: ${defaultArgs.out}`,
			default: defaultArgs.out,
		},
		{
			name: "docs",
			message: `${separator}\nWhere would you like svetch to output the generated API documentation? - default: ${defaultArgs.docs}`,
			default: defaultArgs.docs,
		},
		{
			name: "staticFolder",
			message: `${separator}\nWhere is your static folder located?\n - default: ${defaultArgs.staticFolder}`,
			default: defaultArgs.staticFolder,
		},
	]);

	fs.writeFileSync(
		".svetchrc",
		JSON.stringify({ ...defaultArgs, ...responses }, null, 2)
	);
	log.success(
		1,
		`Svetch configuration written to ${path.resolve(
			workingDir,
			".svetchrc"
		)}\n\nenjoy ;)\n\n${separator}`
	);
}

const isInit = process.argv[2] === "init";

// Get the command-line arguments
const args: string[] = process.argv.slice(3); // Exclude the first two elements (node binary and script file path)

function parseArgs(rawArgs: string[]): ScriptArgs {
	// Check if .svetchrc file exists
	const svetchrcExists = fs.existsSync(".svetchrc");
	// Use .svetchrc file if it exists
	const parsedArgs = svetchrcExists ? readSvetchrc() : {};

	// Parse command-line arguments
	for (let i = 0; i < rawArgs.length; i += 2) {
		const argName = rawArgs[i].replace("--", "");
		const argValue = rawArgs[i + 1];
		parsedArgs[argName] = argValue;
	}

	// Merge parsed arguments with default values
	return { ...defaultArgs, ...parsedArgs };
}

const {
	tsconfig,
	framework,
	input,
	out,
	logLevel,
	filter,
	docs,
	staticFolder,
	telemetry,
} = parseArgs(args);

const project = new Project({
	compilerOptions: { allowJs: true },
	tsConfigFilePath: tsconfig,
});

const typeChecker = project.getTypeChecker();

project.addSourceFilesAtPaths([`${input}/**/*+server.ts`]);

// Change output path here:
const outputPath = path.join(workingDir, out);
const schemaOutputPath = path.join(workingDir, staticFolder);
const docsOutputPath = path.join(workingDir, docs);

type MethodMap = Map<HTTP_METHOD, EndpointDefinition>;
const endpoints: Map<string, MethodMap> = new Map();
let actions: Record<string, Record<string, any>> = {};
let importMap = {};

const processedTypes = new Map<string, string>();
let callCount = 0;

interface ProcessTypeNodeResult {
  typeString: string;
  imports: Set<string>;
}

function processTypeNode(node: TypeNode): ProcessTypeNodeResult {
  const typeText = node.getText();
  const memoized = new WeakMap<TypeNode, ProcessTypeNodeResult>();
  
  function processInner(innerNode: TypeNode): ProcessTypeNodeResult {
    if (memoized.has(innerNode)) {
      return memoized.get(innerNode)!;
    }
    
    let result: ProcessTypeNodeResult;
    
    if (
      Node.isTypeReference(innerNode) ||
      Node.hasStructure(innerNode) ||
      typeText.includes("Prisma")
    ) {
      result = footprintOfType({
        file: innerNode.getSourceFile(),
        type: innerNode.getType(),
        node: innerNode,
      });
    } else if (Node.isObjectLiteralExpression(innerNode)) {
      const processedObject = processObjectLiteral(innerNode as ObjectLiteralExpression);
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

function extractPathParams(path: string) {
	const params = path.match(/:([^/]+)/g);
	let pathParamsStr = "";

	if (params) {
		for (const param of params) {
			pathParamsStr += `${param.slice(1)}: string; `;
		}
	}

	return `{ ${pathParamsStr} }`;
}

function extractQueryParameters(declaration: FunctionDeclaration): string {
	const queryParameters: Record<string, string> = {};

	let searchParamsVariables = new Set();

	declaration.forEachDescendant((node: Node) => {
		// Detect any declaration of url.searchParams and store the variable name
		if (node.getKind() === SyntaxKind.VariableDeclaration) {
			const variableDeclaration = node.asKindOrThrow(
				SyntaxKind.VariableDeclaration
			);
			const initializer = variableDeclaration.getInitializer();

			if (initializer && Node.isPropertyAccessExpression(initializer)) {
				const expression = initializer.getExpression();
				const property = initializer.getName();

				if (expression.getText() === "url" && property === "searchParams") {
					const variableName = variableDeclaration.getName();
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

					if (
						args.length > 0 &&
						args[0].getKind() === SyntaxKind.StringLiteral
					) {
						const queryParameterName = (
							args[0] as StringLiteral
						).getLiteralText();
						queryParameters[queryParameterName] = typeChecker
							.getTypeAtLocation(
								node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)
							)
							.getText();
					}
				}
			} else if (Node.isElementAccessExpression(expression)) {
				const expressionName = expression.getExpression().getText();

				if (searchParamsVariables.has(expressionName)) {
					const argumentExpression = expression.getArgumentExpression();
					if (
						argumentExpression &&
						argumentExpression.getKind() === SyntaxKind.StringLiteral
					) {
						const queryParameterName = (
							argumentExpression as StringLiteral
						).getLiteralText();
						queryParameters[queryParameterName] = typeChecker
							.getTypeAtLocation(argumentExpression)
							.getText();
					}
				}
			}
		}

		// Get the type of the constant when the query string is assigned to it
		if (node.getKind() === SyntaxKind.VariableDeclaration) {
			const variableDeclaration = node.asKindOrThrow(
				SyntaxKind.VariableDeclaration
			);
			const initializer = variableDeclaration.getInitializer();

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
						const variableType =
							typeChecker.getTypeAtLocation(variableDeclaration);
						const variableName = variableDeclaration.getName();
						queryParameters[variableName] = variableType.getText();
					}
				} else if (Node.isElementAccessExpression(expression)) {
					const expressionName = expression.getExpression().getText();

					if (searchParamsVariables.has(expressionName)) {
						const variableType =
							typeChecker.getTypeAtLocation(variableDeclaration);
						const variableName = variableDeclaration.getName();
						queryParameters[variableName] = variableType.getText();
					}
				}
			}
		}
	});

	let queryTypeString = "{ ";
	for (const parameterName in queryParameters) {
		// if nullable
		queryTypeString += `${parameterName}${
			queryParameters[parameterName].includes("null") ||
			queryParameters[parameterName].includes("undefined") ||
			queryParameters[parameterName].includes("never")
				? "?"
				: ""
		}: ${queryParameters[parameterName]}; `;
	}
	queryTypeString += "}";

	return queryTypeString;
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
			log.warn(
				3,
				`No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed`
			);
			return;
		}

		log.info(3, `[SVELTEKIT]: Looking for $types.d.ts`);

		if (!requestEventTypePath) {
			log.error(
				3,
				`No generated $types.d.ts found, make sure you run 'npm run dev' once at least...`
			);
			return;
		}

		const routeParamsType = project
			.addSourceFileAtPath(requestEventTypePath)
			?.getTypeAlias("RouteParams");

		if (!routeParamsType) {
			log.error(
				3,
				`No RequestEvent found in types.d.ts, make sure you run 'npm run dev' once at least...`
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
	declaration: FunctionDeclaration | VariableDeclaration
) {
	const file = declaration.getSourceFile();
	const methodType = declaration.getName();
	if (
		methodType !== "GET" &&
		methodType !== "POST" &&
		methodType !== "PUT" &&
		methodType !== "PATCH" &&
		methodType !== "DELETE"
	) {
		log.warn(
			2,
			`Unsupported method type ${methodType} in ${file.getFilePath()}`
		);
		return;
	}

	const filePath = declaration.getSourceFile().getFilePath();
	const apiPath = processFilePath(filePath);

	let endpoint = endpoints.get(apiPath);
	if (!endpoint) {
		endpoint = new Map();
		endpoints.set(apiPath, endpoint);
	}

	log.header(2, `${methodType}`);

	const allDeclarations = getAllDeclarations(declaration);
	if (!allDeclarations || allDeclarations.length === 0) {
		log.error(3, `No declarations found`);
		return;
	}

	if (framework === "sveltekit") {
		extractRootDirTypes(declaration);
	}

	const payloadNode = extractPayload(allDeclarations, typeChecker);
	if (payloadNode) {
		log.success(3, "Detected payload declaration");
	} else {
		log.warn(
			3,
			`No payload declaration found for ${methodType} method in ${file.getFilePath()}`
		);
	}

	const jsdoc = extractJSDoc(declaration);

	let method = endpoint.get(methodType);
	if (!method) {
		method = {};
		endpoint.set(methodType, method);
	}

	if (jsdoc.length > 0 && jsdoc[0]?.[0]) {
		method.docs = commentParser.stringify(jsdoc[0][0]);
	}

	const { status, resultsDeclaration, addedResponses } = processDeclarations(
		allDeclarations,
		method
	);

	if (!resultsDeclaration) {
		log.warn(
			2,
			`No results declaration found for ${methodType} method in ${file.getFilePath()}`
		);
	}

	if (["POST", "PUT", "PATCH"].includes(methodType) && !payloadNode) {
		log.warn(
			2,
			`No payload declaration found for ${methodType} method in ${file.getFilePath()}`
		);
	}

	endpoint.set(methodType, method);

	const pathParam = extractPathParams(apiPath);
  const queryParams = extractQueryParameters(declaration);
  const { typeString: bodyParam, imports: bodyImports } = payloadNode 
    ? formatComplexType(payloadNode.getType().getText())
    : { typeString: "never", imports: new Set<string>() };

  if (methodType === "GET" || methodType === "DELETE") {
    method["parameters"] = {
      path: formatComplexType(pathParam),
      query: formatComplexType(queryParams)
    };
  } else {
    method["parameters"] = {
      body: bodyParam
    };
  }

  if (!method.imports) {
    method.imports = new Set<string>();
  }
  bodyImports.forEach(imp => method.imports?.add(imp));
  
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

function logPayloadDetection(
	payloadNode: Node | undefined,
	methodType: string,
	file: SourceFile
) {
	if (payloadNode) {
		log.success(3, "Detected payload declaration");
	} else {
		log.warn(
			3,
			`No payload declaration found for ${methodType} method in ${file.getFilePath()}`
		);
	}
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
	method: EndpointDefinition
) {
	let status = 200;
	let resultsDeclaration: TypeReferenceNode | undefined;
	const addedResponses = new Set<string>();

	allDeclarations.forEach((node: Node) => {
		if (Node.isReturnStatement(node)) {
			const result = processReturnStatement(node, status, resultsDeclaration);
			if (result) {
				({ status, resultsDeclaration } = result);
			}
		} else if (
			Node.isVariableDeclaration(node) &&
			node.getName() === "results"
		) {
			resultsDeclaration = processReturnVariable(resultsDeclaration, node);
		}

		if (resultsDeclaration) {
			const processedResponse = processTypeNode(resultsDeclaration);
			const responseString = JSON.stringify(processedResponse);
			if (!addedResponses.has(responseString)) {
				if (!method.responses) {
					method.responses = {};
				}
				if (!method.responses[status]) {
					method.responses[status] = [];
				}
				method.responses[status]!.push(processedResponse);
				addedResponses.add(responseString);
			}
		}
		processThrowDetails(node, method);
	});

	return { status, resultsDeclaration, addedResponses };
}

function processReturnStatement(
	node: Node,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined
) {
	const expression = node.getExpression();
	if (!expression) {
		log.error(3, `Detected return statement without expression`);
		return null;
	}

	if (
		!node.getText().includes("json") &&
		!node.getText().includes("Response")
	) {
		log.error(
			3,
			`Detected return statement (${expression.getText()}) without json() or new Response() constructor, Skipping...`
		);
		return null;
	}

	if (Node.isCallExpression(expression) || Node.isNewExpression(expression)) {
		return processReturnExpression(expression, status, resultsDeclaration);
	} else if (Node.isIdentifier(expression)) {
		return {
			status,
			resultsDeclaration: processReturnIdentifier(
				expression,
				resultsDeclaration
			),
		};
	} else {
		log.warn(
			3,
			`Unhandled return statement with type (${expression.getKindName()}), in ${node
				.getSourceFile()
				.getFilePath()}\n\t\tplease report this to the developer\n\t------\n\t\t${node.getText()}\n\t\t------\n`
		);
		return null;
	}
}

function updateEndpointResponses(
	apiPath: string,
	methodType: string,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined,
	addedResponses: Set<string>
) {
	if (resultsDeclaration) {
		const processedResponse = processTypeNode(resultsDeclaration);
		const responseString = JSON.stringify(processedResponse);
		if (!addedResponses.has(responseString)) {
			init_endpoint_responses({ path: apiPath, method: methodType, status });
			endpoints[apiPath][methodType]!["responses"]![status]!.push(
				processedResponse
			);
			addedResponses.add(responseString);
		}
	}
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

function updateEndpointParameters(
	apiPath: string,
	methodType: string,
	payloadNode: Node | undefined,
	declaration: FunctionDeclaration | VariableDeclaration
) {
	const pathParam = extractPathParams(apiPath);
	const queryParams = extractQueryParameters(declaration);
	const queryOrBodyParam = payloadNode ? processTypeNode(payloadNode) : "never";

	endpoints[apiPath][methodType]["parameters"] =
		methodType === "GET" || methodType === "DELETE"
			? { path: pathParam, query: queryParams }
			: { path: pathParam, body: queryOrBodyParam, query: queryParams };
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
	expression: CallExpression,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined
) {
	log.success(
		3,
		`Detected return statement with expression:\n		---\n		${expression?.getText()}\n		---\n`
	);
	const args = expression.getArguments();
	// get the second argument, which is the Response init object, then get the status property
	if (args.length > 1) {
		const arg = args.find(
			(arg) => arg.getKind() == SyntaxKind.ObjectLiteralExpression
		);
		if (arg) {
			log.warn(
				4,
				`Args: ${arg
					.getChildren()
					.map((arg) => arg.getText())
					.join(", ")}`
			);
			const statusProp = arg
				.getProperties()
				.find(
					(child) =>
						child.getKind() == SyntaxKind.PropertyAssignment &&
						child.getText().includes("status")
				);

			if (statusProp) {
				const statusPropValue = statusProp
					.getChildren()
					.find((child) => child.getKind() == SyntaxKind.NumericLiteral);
				if (statusPropValue) {
					status = parseInt(statusPropValue.getText());
				}
			}
		}
	}

	if (args.length > 0) {
		const arg = args[0];
		if (arg.getKind() == SyntaxKind.Identifier) {
			const symbol = typeChecker.getSymbolAtLocation(arg);
			if (symbol) {
				const declarations = symbol.getDeclarations();
				if (declarations) {
					resultsDeclaration = declarations[0] as TypeReferenceNode;
					if (
						declarations[0].getFirstDescendantByKind(
							SyntaxKind.MethodDeclaration
						)
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
					log.success(
						4,
						`Found (results = ) declaration:`,
						resultsDeclaration.getText().slice(0, 20)
					);
				}
			}
		} else if (arg.getKind() == SyntaxKind.ObjectLiteralExpression) {
			log.success(4, `Found Object results declaration:`, arg.getText());
			resultsDeclaration = arg as TypeReferenceNode;
		} else {
			if (arg.getFirstDescendantByKind(SyntaxKind.MethodDeclaration)) {
				log.error(
					3,
					`Found method declaration, These are unsupported at the moment, but you can report it in github, ${arg.getText()}`
				);
				return {
					status,
					resultsDeclaration: undefined,
				};
			}
			resultsDeclaration = arg as TypeReferenceNode;
			log.warn(
				4,
				`Unhandled return statement, please report this to the developer, ${arg.getText()}, of type ${arg.getKindName()}`
			);
		}
	}
	return { status, resultsDeclaration };
}

function processTypeDeclaration(declaration: TypeAliasDeclaration) {
	const file = declaration.getSourceFile();
	// Add the original logic for handling TypeAliasDeclaration here
	// based on your previous code.
	const filePath = declaration.getSourceFile().getFilePath();
	const apiPath = filePath
		.slice(filePath.indexOf("api/") + 4, filePath.lastIndexOf("/"))
		.replace(/\[\w+\]/g, ":$&")
		.replace(/\[|\]/g, "");

	if (!endpoints[apiPath]) {
		endpoints[apiPath] = {};
	}

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

function processActionsDeclaration(declaration: TypeAliasDeclaration) {
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

			node.getDescendants().forEach((node: Node) => {
				if (Node.isReturnStatement(node)) {
					const expression = node.getExpression();

					if (!expression) {
						log.error(3, `Detected return statement without expression`);
						return;
					}

					if (node.getText().includes("fail")) {
						log.error(3, `Detected return statement with fail`);
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
							resultsDeclaration
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
							`Unhandled return statement with type (${expression.getKindName()}), in ${node
								.getSourceFile()
								.getFilePath()}\n		please report this to the developer\n	------\n		${node.getText()}\n		------\n`
						);
					}
				} else if (
					Node.isVariableDeclaration(node) &&
					node.getName() === "results"
				) {
					resultsDeclaration = processReturnVariable(resultsDeclaration, node);
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
			});
		}
	});
}

let processedFiles = new Set();

function processFiles() {
	const processedFiles = new Set<string>();

	project.getSourceFiles().forEach((file) => {
		const filePath = file.getFilePath();
		if (processedFiles.has(filePath)) return;

		processedFiles.add(filePath);
		telemetryPayload.data.processed_files_count += 1;

		log.header(1, `⌘  Processing: ${filePath.replace(workingDir, "")}`);

		file.getExportedDeclarations().forEach((declarationsArray) => {
			declarationsArray.forEach((declaration) => {
				if (isValidDeclaration(declaration)) {
					processDeclaration(file, declaration);
				}
			});
		});
	});
}

function isValidDeclaration(declaration: ExportedDeclarations): boolean {
	const validNames = [
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
	];
	return (
		(declaration instanceof FunctionDeclaration ||
			declaration instanceof VariableDeclaration ||
			declaration instanceof TypeAliasDeclaration) &&
		validNames.includes(declaration.getName()!)
	);
}

function processDeclaration(
	file: SourceFile,
	declaration: ExportedDeclarations
) {
	const declarationName = declaration.getName()!;

	if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(declarationName)) {
		processFunctionDeclaration(
			declaration as FunctionDeclaration | VariableDeclaration
		);
	} else if (
		["_Get", "_Post", "_Put", "_Patch", "_Delete"].includes(declarationName)
	) {
		processTypeDeclaration(declaration as TypeAliasDeclaration);
	} else if (declarationName === "actions") {
		processActionsDeclaration(declaration as TypeAliasDeclaration);
	}
}

let output = "";
let actionOutput = "";

function generateOutput(endpoints: Map<string, Map<HTTP_METHOD, EndpointDefinition>>): string {
  let importsSet = new Set<string>();
  let output = "export interface APIPaths {\n";

  for (const [apiPath, methodMap] of endpoints) {
    const formattedPath = apiPath
      .replace(workingDir, "")
      .replace(/\\/g, "/")
      .replace("/src/routes", "")
      .replace("/+server.ts", "");

    output += `  '${formattedPath}': {\n`;

    for (const [method, endpointDef] of methodMap) {
      if (endpointDef.docs) {
        output += `    ${endpointDef.docs}\n`;
      }

      output += `    ${method}: {\n`;
      output += `      parameters: `;
      
      if (endpointDef.parameters) {
        if ('body' in endpointDef.parameters) {
          output += `{ body: ${endpointDef.parameters.body} },\n`;
        } else {
          output += `{\n`;
          for (const [paramType, paramValue] of Object.entries(endpointDef.parameters)) {
            output += `        ${paramType}: ${paramValue},\n`;
          }
          output += `      },\n`;
        }
      } else {
        output += `{},\n`;
      }
      
      output += `      responses: {\n`;
      
      if (endpointDef.responses) {
        for (const [statusCode, response] of Object.entries(endpointDef.responses)) {
          output += `        ${statusCode}: ${JSON.stringify(response)},\n`;
        }
      }
      
      output += `      },\n`;

      if (endpointDef.errors && Object.keys(endpointDef.errors).length > 0) {
        output += `      errors: {\n`;
        for (const [statusCode, error] of Object.entries(endpointDef.errors)) {
          output += `        ${statusCode}: ${JSON.stringify(error)},\n`;
        }
        output += `      },\n`;
      }

      output += `    },\n`;

      // Collect imports
      if (endpointDef.imports) {
        endpointDef.imports.forEach(imp => importsSet.add(imp));
      }
    }

    output += `  },\n`;
  }

  output += "};\n";

  // Add imports at the top of the file
  const importsString = Array.from(importsSet).join('\n');
  return importsString + '\n\n' + output;
}

function formatComplexType(value: any): FormattedType {
  // TODO: HANDLE NAMESPACES
  if (typeof value === 'string') {
    if (value.startsWith('import(')) {
      const match = value.match(/import\("(.+)"\)\.(.+)/);
      if (match) {
        const [, importPath, importedType] = match;
        return {
          typeString: importedType,
          imports: new Set([`import { ${importedType.split(".").at(0)} } from "${importPath}";`])
        };
      }
    }
    return { typeString: value, imports: new Set() };
  }
  
  if (Array.isArray(value)) {
    const results = value.map(formatComplexType);
    const imports = new Set(results.flatMap(r => Array.from(r.imports)));
    const typeString = `[${results.map(r => r.typeString).join(', ')}]`;
    return { typeString, imports };
  }
  
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).map(([k, v]) => {
      const formatted = formatComplexType(v);
      return [k, formatted] as [string, FormattedType];
    });
    
    const imports = new Set(entries.flatMap(([, v]) => Array.from(v.imports)));
    const typeString = `{\n${entries.map(([k, v]) => `    ${k}: ${v.typeString};`).join('\n')}\n  }`;
    return { typeString, imports };
  }
  
  return { typeString: String(value), imports: new Set() };
}

function formatObject(obj: any): string {
	if (obj === undefined) {
		return "undefined";
	}
	if (Array.isArray(obj)) {
		return `[${obj.map(formatObject).join(", ")}]`;
	} else if (typeof obj === "string") {
		if (/^\{\s*\}$/.test(obj)) {
			return "never";
		}
		return `${obj}`;
	} else if (obj == null || JSON.stringify(obj) === JSON.stringify({})) {
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

function generateActionsOutput() {
	for (const apiPath in actions) {
		actionOutput += `  '${apiPath}': {\n`;
		for (const method in actions[apiPath]) {
			// const docs = actions[apiPath][method]["docs"];
			// if (docs.length > 0) {
			//   console.log("docs", docs);
			//   actionOutput += `   ${docs}`;
			// }

			actionOutput += `    ${method}: {\n`;

			for (const action in actions[apiPath][method]) {
				actionOutput += `      parameters: {\n`;

				const parameters = actions[apiPath][method][action]["parameters"];
				for (const paramType in parameters) {
					let paramValue = formatObject(parameters[paramType]);
					let optional = paramValue === "never" ? "?" : "";
					actionOutput += `        ${paramType}${optional}: ${paramValue},\n`;
				}
				actionOutput += `      },\n`;
				actionOutput += `      responses: {\n`;

				for (const statusCode in actions[apiPath][method][action][
					"responses"
				]) {
					let response =
						actions[apiPath][method][action]["responses"][statusCode];
					const formattedResponse = formatObject(response);
					if (formattedResponse.trim() === "") {
						continue;
					}
					actionOutput += `        ${statusCode}: ${formatObject(response)},\n`;
				}

				actionOutput += `      }\n`;
				actionOutput += `      errors: {\n`;

				for (const statusCode in actions[apiPath][method][action]["errors"]) {
					let response = actions[apiPath][method][action]["errors"][statusCode];
					actionOutput += `        ${statusCode}: ${formatObject(response)},\n`;
				}

				actionOutput += `      }\n`;
				actionOutput += `    },\n`;
			}
		}
		actionOutput += "  },\n";
	}

	actionOutput = "export interface ActionPaths {\n" + actionOutput + "};\n";
}

function generateInterfaces() {
	const interfaces = fs
		.readFileSync(path.resolve(__dirname, "./utils/interfaces.ts"))
		.toString();
	output = interfaces + "\n" + output;

	// add the import statements at the top
	let importsOutput = "";
	for (const [importName, moduleName] of Object.entries(importMap)) {
		if (
			moduleName !== "./$types" &&
			!["Post", "Get", "Put", "Patch", "Delete"].includes(importName)
		) {
			importsOutput += `import { ${importName} } from "${moduleName}";\n`;
		}
	}

	const final_output = importsOutput + output + actionOutput;

	// count how many lines are in the output
	telemetryPayload.data.generated_lines_of_code +=
		final_output.split("\n").length;

	fs.writeFileSync(path.join(outputPath, "api.ts"), final_output);

	log.success(
		2,
		`generated Svetch API types in ${path.join(outputPath, "api.ts")}`
	);
}

function generateClient() {
	const interfaces = fs
		.readFileSync(path.resolve(__dirname, "./utils/client.ts"))
		.toString();
	output = interfaces + "\n" + output;

	// add the import statements at the top
	let importsOutput = "";
	for (const [importName, moduleName] of Object.entries(importMap)) {
		if (
			moduleName !== "./$types" &&
			!["Post", "Get", "Put", "Patch", "Delete"].includes(importName)
		) {
			importsOutput += `import { ${importName} } from "${moduleName}";\n`;
		}
	}

	const final_output = importsOutput + output;

	telemetryPayload.data.generated_lines_of_code +=
		final_output.split("\n").length;

	fs.writeFileSync(path.join(outputPath, "client.ts"), final_output);

	log.success(
		2,
		`Genererated Svetch Client in ${path.join(outputPath, "client.ts")}`
	);
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

function generateSchema() {
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
		[resolve(`${out}/api.ts`)]
		// compilerOptions,
		// basePath
	);

	// We can either get the schema for one file and one type...
	const schema = TJS.generateSchema(program, "APIPaths", settings);

	jsonSchema = schema;

	// ensure schema path is there
	if (!fs.existsSync(schemaOutputPath)) {
		fs.mkdirSync(schemaOutputPath);
	}

	fs.writeFileSync(
		path.join(outputPath, "schema.json"),
		JSON.stringify(schema, null, 2)
	);

	fs.writeFileSync(
		path.join(schemaOutputPath, "apiSchema.json"),
		JSON.stringify(schema)
	);

	telemetryPayload.data.generated_lines_of_code +=
		JSON.stringify(schema).split("\n").length;
}

async function generateZodSchema() {
	const schema = parseSchema(jsonSchema as any);

	const output = `import { z } from 'zod';\n\nexport const schema = ${schema};`;

	telemetryPayload.data.generated_lines_of_code += output.split("\n").length;

	//   write
	fs.writeFileSync(path.join(outputPath, "zod.ts"), output);
	log.success(2, `Generated zod schema in ${path.join(outputPath, "zod.ts")}`);
}

function generateSvetchClient() {
	let client = fs
		.readFileSync(path.resolve(__dirname, "./utils/client.ts"))
		.toString();

	// if the schema was generated, add it to the client
	if (fs.existsSync(path.join(outputPath, "zod.ts"))) {
		client = `import { schema } from './zod'` + "\n" + client;
	}

	if (fs.existsSync(path.join(outputPath, "schema.json"))) {
		client = `import type { APIPaths } from './api'` + "\n" + client;
	}

	// write
	fs.writeFileSync(path.join(outputPath, "client.ts"), client);
	log.success(2, `Generated client in ${path.join(outputPath, "client.ts")}`);
}

function generateSvetchDocs() {
	const docs = fs
		.readFileSync(path.resolve(__dirname, "./static/docs/+page.svelte"))
		.toString()
		.replace(
			"[CLIENT_PATH]",
			path.join(workingDir, out, "client").replace(workingDir, "").slice(1)
		);
	// get all components inside the static/docs/components folder
	const body_block = fs
		.readFileSync(
			path.resolve(__dirname, "./static/docs/components/BodyBlock.svelte")
		)
		.toString()
		.replace(
			"[INTERFACE_PATH]",
			path.join(workingDir, out, "api").replace(workingDir, "").slice(1)
		);
	const Collapsible = fs
		.readFileSync(
			path.resolve(__dirname, "./static/docs/components/Collapsible.svelte")
		)
		.toString();

	// get all components inside the static/docs/components folder
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
	log.success(2, `Generated docs in ${docsOutputPath}`);
}

function main() {
	// check if input folder exists

	if (!fs.existsSync(input)) {
		log.error(1, `Input folder ${input} does not exist`);
		log.warn(
			1,
			`Please change it in your .svetchrc file here: 👉 [${path.resolve(
				workingDir,
				".svetchrc"
			)}]\nOr run svetch init again.\n\nExiting...\n\n`
		);
		process.exit(1);
	}
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, { recursive: true });
	}
	log.info(1, `Generating API types in ${outputPath}`);
	processFiles();
	log.header(1, `Processed, Writing files...`);
	output += generateOutput(endpoints);
	generateActionsOutput();
	generateInterfaces();
	generateClient();
	try {
		generateSchema();
		generateZodSchema();
		generateSvetchDocs();
	} catch (error) {
		log.error(
			1,
			`Error generating schema, please report this to the developer, ${error}`
		);
	}
	generateSvetchClient();

	try {
		sendTelemetry();
	} catch (error) {}

	log.success(
		1,
		`\n${separator}\nDone!, now import Svetch using the following code:\n\n`
	);
	log.info(
		1,
		`import { Svetch } from ${path
			.join(workingDir, out, "client")
			.replace(workingDir, "")
			.slice(1)};`
	);
	log.info(1, `const svetch = new Svetch();\n\n`);

	// find how many files are in the project, that end in +server.ts
	const totalFiles = project.getSourceFiles().filter((file) => {
		return file.getFilePath().includes("+server.ts");
	}).length;

	// if files more than 10, prompt user to purchase
	if (totalFiles > 10) {
		log.info(
			1,
			`
      \x1b[33m⚠ Wow! You have ${totalFiles} endpoints in your project. You're certainly getting the most out of Svetch!\n
      By now, you must have realized the value Svetch brings to your development process - the time it saves, the consistency it provides, and the boilerplate it cuts out. It's become a crucial part of your toolkit.

      \x1b[37mSvetch is a labor of love, maintained and continually improved to help developers like you create amazing things with less effort. But we need your support to keep it growing and evolving.
      By purchasing a license, you contribute to the future development and maintenance of Svetch.

      Plus, with a full license, you can use Svetch with no restrictions, no matter how big your projects get! 
    `
		);
		log.header(
			1,
			`
      👉 Support the development and get your license here: [https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d]
      
      Thank you for using Svetch and for your support!
      `
		);
		// the library will still work
	}
}

export function runAll() {
	if (isInit || !fs.existsSync(path.resolve(workingDir, ".svetchrc"))) {
		initSvetchrc().then(() => {
			checkVersion();
			main();
		});
	} else {
		checkVersion();
		main();
	}
}

import { exec } from "child_process";
import { Telemetry } from "./types/telemetry";
import { log } from "./utils/logger";
import { extractPayload } from "./utils/endpoint_extractors";
const packageJson = require(path.resolve(__dirname, "../package.json"));

function checkVersion() {
	const packageName = packageJson.name;
	const currentVersion = packageJson.version;
	exec(`npm show ${packageName} version`, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		const latestVersion = stdout.trim();

		telemetryPayload.data.script_version = currentVersion;

		console.log(`Current version: ${currentVersion}`);
		console.log(`Latest version: ${latestVersion}`);

		if (currentVersion !== latestVersion) {
			console.log(`A newer version of ${packageName} is available.`);
		} else {
			console.log(`You are using the latest version of ${packageName}.`);
		}
	});
}

// runAll()
