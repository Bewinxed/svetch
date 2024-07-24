import * as commentParser from "comment-parser";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
	type CallExpression,
	type CallLikeExpression,
	type CatchClause,
	type ExportedDeclarations,
	Expression,
	FunctionDeclaration,
	Identifier,
	type ImportDeclaration,
	type NewExpression,
	Node,
	ObjectLiteralExpression,
	Project,
	PropertyAssignment,
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
import { fileURLToPath } from "node:url";
import ora, { type Ora } from "ora";
import { footprintOfType } from "./utils/svelte-codegen.js";
import type { Telemetry } from "./types/telemetry.js";
import { extractPayloadTypeNode } from "./utils/endpoint_extractors.js";
import { log } from "./utils/logger.js";
import { spinner } from "./utils/ux/spinner.js";
import { parseSchema } from "json-schema-to-zod";

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

function processTypeNode(node: Node): FormattedType {
	return footprintOfType({
		file: node.getSourceFile(),
		type: typeChecker.getTypeAtLocation(node),
		node: node,
		typeChecker: typeChecker,
	});
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
				type: typeChecker.getTypeAtLocation(innerNode),
				node: innerNode,
				typeChecker: typeChecker,
			});
		} else if (Node.isObjectLiteralExpression(innerNode)) {
			const processedObject = processObjectLiteral(
				innerNode as ObjectLiteralExpression,
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
			SyntaxKind.ComputedPropertyName,
		);
		if (computedName) {
			const identifier = computedName.getFirstChildByKind(
				SyntaxKind.Identifier,
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
	node: Node,
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
	typeChecker: TypeChecker,
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
	declaration: FunctionDeclaration,
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
				 ${declaration.getFunctions()?.at(0)?.getName()}`,
		);
	}
}

function extractCatchThrowDetails(
	node: Node,
): { status: string; message: string; type: string } | null {
	if (Node.isCatchClause(node)) {
		// log types of all children
		const throwBlock = node.getFirstChildByKind(SyntaxKind.Block);
		if (!throwBlock) {
			return null;
		}
		const throwStatement = throwBlock.getFirstChildByKind(
			SyntaxKind.ThrowStatement,
		);
		if (throwStatement) {
			const callExpression = throwStatement.getFirstChildByKind(
				SyntaxKind.CallExpression,
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
	declaration: FunctionDeclaration | VariableDeclaration,
	spinner: Ora,
) {
	if (framework === "sveltekit") {
		const requestEventTypePath = path.resolve(
			workingDir,
			declaration
				.getSourceFile()
				.getFilePath()
				.replace(workingDir, ".svelte-kit/types")
				.replace("/+server.ts", "/$types.d.ts"),
		);

		if (!fs.existsSync(requestEventTypePath)) {
			spinner.warn(
				`${ansiColors.yellow(
					'No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed',
				)}`,
			);
			return;
		}

		const routeParamsType = project
			.addSourceFileAtPath(requestEventTypePath)
			?.getTypeAlias("RouteParams");

		if (!routeParamsType) {
			spinner.warn(
				`No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed`,
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
): void {
	const spinner = ora({
		color: "yellow",
		indent: 5,
	}).start();
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
		extractRootDirTypes(declaration, spinner);
	}

	const payloadNode = extractPayloadTypeNode(allDeclarations);
	if (!payloadNode) {
		spinner.warn(
			`No request body declaration found for ${methodType} method in ${filePath}`,
		);
	}
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

	extractEndpointResponses(allDeclarations, method);

	if (!method.responses) {
		spinner.warn(
			`No response body found for ${methodType} method in ${filePath}, (Declare this using const results = {...}, new Response(...), or json(...))`,
		);
	}

	if (["POST", "PUT", "PATCH"].includes(methodType) && !payloadNode) {
		spinner.warn(
			`No payload declaration found for ${methodType} method in ${filePath}, (Declare this using const payload = {...} as TYPE`,
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
	declaration: FunctionDeclaration | VariableDeclaration,
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
				jsdoc[0]?.tags.some((tag) => tag.tag === "svetch"),
		);
}

function extractEndpointResponses(
	allDeclarations: Node[],
	method: EndpointDefinition,
) {
	if (!method.responses) {
		method.responses = {};
	}

	const spinner = ora({
		color: "yellow",
		indent: 7,
	}).start();

	for (const node of allDeclarations) {
		if (Node.isReturnStatement(node)) {
			const result = processReturnStatement(node, spinner);
			if (result?.resultsDeclaration) {
				method.responses[result.status] ??= [];
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				method.responses[result.status]!.push(
					processTypeNode(result?.resultsDeclaration),
				);
			} else {
				spinner.fail(
					`Unhandled return statement
              ▸ file:  ${node
								.getSourceFile()
								.getFilePath()}:${node.getStartLineNumber()}
              ▸ type: ${node?.getKindName()}
              ▸ please report this to the developer, ${node.getText()}`,
				);
			}
		} else if (
			Node.isVariableDeclaration(node) &&
			(node.getName() === "result" || node.getName() === "result")
		) {
			const initializer = node.getInitializer();
			if (!initializer) {
				spinner.fail(
					`Unhandled (results =) statement, please report this to the developer, ${node_text_snippet(
						node,
					)}, of type ${node?.getKindName()}`,
				);
				return;
			}

			const result = processResultsNode(initializer, spinner);
			if (result?.resultsDeclaration) {
				method.responses[200] ??= [];
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				method.responses[200]!.push(processTypeNode(result.resultsDeclaration));
			} else {
				spinner.fail(
					`Unhandled (results =) statement, please report this to the developer, ${node_text_snippet(
						node,
					)}, of type ${node?.getKindName()}`,
				);
			}
		}

		processThrowDetails(node, method);
	}
}

function node_text_snippet(node: Node) {
	const text = node.getText();
	const start = Math.max(0, text.lastIndexOf("\n", 100));
	const end = Math.min(text.length, text.indexOf("\n", 300));
	return text.slice(start, end);
}

function processResultsNode(expression: Expression, spinner: Ora) {
	if (Node.isCallExpression(expression) || Node.isNewExpression(expression)) {
		return processReturnExpression(expression, spinner);
	}
	if (Node.isIdentifier(expression)) {
		return {
			status: 200,
			resultsDeclaration: processReturnIdentifier(expression),
		};
	}
}

function processReturnStatement(node: ReturnStatement, spinner: Ora) {
	const expression = node.getExpression();
	if (!expression) {
		spinner.warn(
			`Detected return statement without expression ${node_text_snippet(node)}`,
		);
		return null;
	}

	if (
		!node.getText().includes("json") &&
		!node.getText().includes("Response")
	) {
		spinner.warn(
			`Detected return statement (${node_text_snippet(
				expression,
			)}) without json() or new Response() constructor, Skipping...`,
		);
		return null;
	}
	const result = processResultsNode(expression, spinner);
	if (!result) {
		spinner.warn(
			`Unhandled return statement with type (${expression.getKindName()}), in ${node
				.getSourceFile()
				.getFilePath()}\n\t\tplease report this to the developer\n\t------\n\t\t${node.getText()}\n\t\t------\n`,
		);
		return null;
	}
	return result;
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

function processReturnVariable(node: VariableDeclaration) {
	const type_node = node.getTypeNode() as TypeReferenceNode;
	if (!type_node) {
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
	return type_node;
}

function processReturnIdentifier(expression: Identifier) {
	const symbol = typeChecker.getSymbolAtLocation(expression);
	if (symbol) {
		const declarations = symbol.getDeclarations();
		return declarations.at(0) as Node;
	}
}

function processFailExpression(
	expression: CallExpression,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined,
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
			(arg) => arg.getKind() == SyntaxKind.ObjectLiteralExpression,
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
	spinner: Ora,
): {
	status: number;
	resultsDeclaration?: Identifier | ObjectLiteralExpression | Node;
} {
	const result: {
		status: number;
		resultsDeclaration?: Identifier | ObjectLiteralExpression | Node;
	} = {
		status: 200,
		resultsDeclaration: undefined,
	};
	spinner.info(
		`Detected return statement ▸ ${ansiColors.green(expression.getKindName())}`,
	);
	expression.getArguments().forEach((arg, i) => {
		if (i === 0) {
			if (Identifier.isIdentifier(arg)) {
				result.resultsDeclaration = processReturnIdentifier(arg);
			} else if (
				Node.isLiteralExpression(arg) ||
				Node.isTemplateExpression(arg)
			) {
				result.resultsDeclaration = arg;
			} else if (ObjectLiteralExpression.isObjectLiteralExpression(arg)) {
				result.resultsDeclaration = arg;
			} else if (arg?.getFirstDescendantByKind(SyntaxKind.MethodDeclaration)) {
				spinner.warn(
					`Found method declaration, These are unsupported at the moment, but you can report it in github, ${node_text_snippet(
						arg,
					)}`,
				);
			}
			// handle asKind expression
			else if (Node.isAsExpression(arg)) {
				const expression = arg.getExpression();
				if (expression) {
					result.resultsDeclaration = expression;
				}
			}
		} else if (
			!result.resultsDeclaration &&
			ObjectLiteralExpression.isObjectLiteralExpression(arg)
		) {
			const properties = arg.getProperties();
			for (const property of properties) {
				if (PropertyAssignment.isPropertyAssignment(property)) {
					const initializer = property.getInitializer();
					if (initializer?.getText().includes("status")) {
						result.status = parseInt(initializer.getText());
					}
					break;
				}
			}
		}
	});
	return result;
}

function processTypeDeclaration(
	declaration: TypeAliasDeclaration,
	spinner: Ora,
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
		typeArguments[typeArguments.length - 1],
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
	spinner: Ora,
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
		SyntaxKind.ObjectLiteralExpression,
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
					`No payload declaration found for ${apiPath}.${actionName}`,
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
							resultsDeclaration,
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
							resultsDeclaration,
							spinner,
						));
					} else if (expression && Node.isIdentifier(expression)) {
						resultsDeclaration = processReturnIdentifier(
							expression,
							resultsDeclaration,
						);
					} else if (expression && Node.isObjectLiteralExpression(expression)) {
						resultsDeclaration = expression;
					} else {
						log.warn(
							3,
							`Unhandled return statement with type (${expression.getKindName()}), in ${subnode
								.getSourceFile()
								.getFilePath()}\n		please report this to the developer\n	------\n		${subnode.getText()}\n		------\n`,
						);
					}
				} else if (
					Node.isVariableDeclaration(subnode) &&
					subnode.getName() === "results"
				) {
					resultsDeclaration = processReturnVariable(
						resultsDeclaration,
						subnode,
					);
				}

				if (!actions[apiPath][methodType][actionName]["responses"][status]) {
					actions[apiPath][methodType][actionName]["responses"][status] = [];
				}

				if (resultsDeclaration) {
					const processedResponse = processTypeNode(resultsDeclaration);
					if (!addedResponses.has(JSON.stringify(processedResponse))) {
						actions[apiPath][methodType][actionName]["responses"][status].push(
							processedResponse,
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

async function processFiles(spinner: Ora) {
	const start = performance.now();
	const all_files = project.getSourceFiles();
	spinner.text = "Scanning for API endpoints...";
	spinner.info(
		`Found ${all_files.length} files in ${ms_to_human_readable(
			performance.now() - start,
		)}`,
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
				file.getExportedDeclarations().values(),
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
						].includes(d.getName() || ""),
				) as (
				| FunctionDeclaration
				| VariableDeclaration
				| TypeAliasDeclaration
			)[];

			for (const declaration of valid_declarations) {
				await process_file_declarations(file, declaration);
			}
			valid_files.add(filePath);
		}),
	);
	const end = performance.now();
	spinner.succeed(
		`Processed ${all_files.length} files in ${ms_to_human_readable(
			end - start,
		)}`,
	);
	return valid_files.size;
}

async function process_file_declarations(
	file: SourceFile,
	declaration: FunctionDeclaration | VariableDeclaration | TypeAliasDeclaration,
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
				file.getFilePath(),
			)}:${declaration.getStartLineNumber()}`,
		);

	if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(declarationName)) {
		processFunctionDeclaration(
			declaration as FunctionDeclaration | VariableDeclaration,
		);
	} else if (
		["_Get", "_Post", "_Put", "_Patch", "_Delete"].includes(declarationName)
	) {
		processTypeDeclaration(
			declaration as TypeAliasDeclaration,
			declaration_spinner,
		);
	} else if (declarationName === "actions") {
		processActionsDeclaration(
			declaration as TypeAliasDeclaration,
			declaration_spinner,
		);
	}
}

async function generateApiTypes() {
	const spinner = ora("Processing API types...").start();
	const imports = new Set<string>();
	let output = "";

	// Create a type for each HTTP method
	const methodTypes: Record<HTTP_METHOD, string> = {
		GET: "",
		POST: "",
		PUT: "",
		DELETE: "",
		PATCH: "",
	};

	// Keep track of which methods have endpoints
	const methodsWithEndpoints = new Set<HTTP_METHOD>();

	for (const [apiPath, methodMap] of endpoints) {
		const formattedPath = apiPath.replace(/^\//, "").replace(/\//g, ".");

		for (const [method, endpointDef] of methodMap) {
			if (!methodTypes[method]) {
				methodTypes[method] = `export interface ${method} {\n`;
			}
			methodsWithEndpoints.add(method);

			methodTypes[method] += `  '${formattedPath}': {\n`;

			if (endpointDef.docs) {
				methodTypes[method] += `    ${endpointDef.docs}\n`;
			}

			methodTypes[method] += `    parameters: ${generateParametersType(
				endpointDef.parameters,
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
					endpointDef.responses,
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
				methodTypes[method] += `    errors: ${generateErrorsType(
					endpointDef.errors,
				)};\n`;
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
	parameters?: EndpointDefinition["parameters"],
): string => {
	if (!parameters) {
		return "undefined";
	}

	let output = "{\n";

	if (parameters.body) {
		output += `        body: ${parameters.body.typeString?.replaceAll(
			`${workingDir}/`,
			"",
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
	responses?: Record<number, FormattedType[]>,
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
						response,
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
			fs.readFileSync(path.join(__dirname, "telemetry.json")).toString(),
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
		JSON.stringify(telemetryPayload),
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
			`Telemetry sent successfully, it contains only statistics, if you don't want it, you can set telemetry to false in your .svetchrc file`,
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
		aliasRef: true,
		// topRef: true,
	};

	// optionally pass ts compiler options
	// const compilerOptions: TJS.CompilerOptions = {
	// strictNullChecks: true,
	// };

	// optionally pass a base path
	// const basePath = "./my-dir";

	const program = TJS.getProgramFromFiles(
		[path.resolve(`${out}/api.ts`)],
		// compilerOptions,
		// basePath
	);

	for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
		// We can either get the schema for one file and one type...
		const schema = TJS.generateSchema(program, method, settings);

		jsonSchema = schema;

		spinner.text = "Writing JSON Schema";
		// ensure schema path is there
		if (!fs.existsSync(schemaOutputPath)) {
			fs.mkdirSync(schemaOutputPath, { recursive: true });
		}

		await Promise.all([
			fs.promises.writeFile(
				path.join(outputPath, `${method}.json`),
				JSON.stringify(schema, null, 2),
			),

			fs.promises.writeFile(
				path.join(schemaOutputPath, `${method}.json`),
				JSON.stringify(schema),
			),
		]);
	}

	spinner.succeed(
		`Generated API JSON schema successfully, ${ms_to_human_readable(
			performance.now() - start,
		)}`,
	);
}

async function generateZodSchema() {
	const schema = parseSchema(jsonSchema as any);

	const output = `import { z } from 'zod';\n\nexport const schema = ${schema};`;

	telemetryPayload.data.generated_lines_of_code += output.split("\n").length;

	//   write
	fs.writeFileSync(path.join(outputPath, "zod.ts"), output);
	log.success(2, `Generated zod schema in ${path.join(outputPath, "zod.ts")}`);
}

function generateSvetchDocs() {
	const docs = fs
		.readFileSync(path.resolve(__dirname, "./assets/docs/+page.svelte"))
		.toString()
		.replace(
			"[CLIENT_PATH]",
			path.join(workingDir, out, "client").replace(workingDir, "").slice(1),
		);
	// get all components inside the assets/docs/components folder
	const body_block = fs
		.readFileSync(
			path.resolve(__dirname, "./assets/docs/components/BodyBlock.svelte"),
		)
		.toString()
		.replace(
			"[INTERFACE_PATH]",
			path.join(workingDir, out, "api").replace(workingDir, "").slice(1),
		);
	const Collapsible = fs
		.readFileSync(
			path.resolve(__dirname, "./assets/docs/components/Collapsible.svelte"),
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
		body_block,
	);
	fs.writeFileSync(
		path.join(docsOutputPath, "components/Collapsible.svelte"),
		Collapsible,
	);
}

function generateImports(importMap: Record<string, string>): string {
	return Object.entries(importMap)
		.filter(
			([importName, moduleName]) =>
				moduleName !== "./$types" &&
				!["Post", "Get", "Put", "Patch", "Delete"].includes(importName),
		)
		.map(
			([importName, moduleName]) =>
				`import { ${importName} } from "${moduleName}";`,
		)
		.join("\n");
}

function generateApiOutput(
	importsOutput: string,
	interfaces: string,
	output: string,
	actionsOutput: string,
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
		},
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
			"utf-8",
		),
		fs.promises.readFile(
			path.resolve(__dirname, "./assets/client.ts"),
			"utf-8",
		),
	]);

	try {
		const importsOutput = generateImports(importMap);

		spinner.info(
			`Generating API Types..., ${ms_to_human_readable(
				performance.now() - start,
			)}`,
		);
		const apiOutput = generateApiOutput(
			importsOutput,
			interfaces,
			apiTypes,
			actionsOutput,
		);

		spinner.info(
			`Generating Client..., ${ms_to_human_readable(
				performance.now() - start,
			)}`,
		);

		spinner.info(
			`Writing files to ${outputPath}, ${ms_to_human_readable(
				performance.now() - start,
			)}`,
		);

		await Promise.all([
			fs.promises.writeFile(path.join(outputPath, "api.ts"), apiOutput, {
				encoding: "utf-8",
			}),
			generateSchema(),
			generateSvetchDocs(),
		]);

		await generateClientOutput(client);

		spinner.succeed(
			`Generated API components successfully, ${ms_to_human_readable(
				performance.now() - start,
			)}`,
		);
	} catch (error) {
		spinner.fail(
			`Error generating schema, please report this to the developer: ${error}`,
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
	schemaOutputPath = path.join(workingDir, staticFolder, "api", "schemas");
	docsOutputPath = path.join(workingDir, docs);

	// check if input folder exists

	if (!fs.existsSync(input)) {
		spinner.fail(
			`Input folder ${input} does not exist. Please change it in your .svetchrc file here: 👉 [${path.resolve(
				workingDir,
				".svetchrc",
			)}]\nOr run svetch init again.\n\nExiting...\n\n`,
		);
		process.exit(1);
	}
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, { recursive: true });
	}
	// throw new Error('I DONT LIKE CINNABON');
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
