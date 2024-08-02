import {
	Node,
	type TypeNode,
	type TypeChecker,
	CallExpression,
	SyntaxKind,
	NewExpression,
	ThrowStatement,
	CatchClause,
	Identifier,
	ObjectLiteralExpression,
	StringLiteral,
	NumericLiteral,
	PropertyAccessExpression,
	PropertyAssignment,
} from "ts-morph";
import { footprintOfType } from "./svelte-codegen.js";
import type { ErrorDetails, FormattedType } from "../types/core.js";
import { extract_kit_error } from "../lib/parsers/sveltekit/responses.js";
import type { Ora } from "ora";
import { log_node_with_location, node_text_snippet } from "./logger.js";

export function extract_payload_node(node: Node) {
	if (Node.isVariableDeclaration(node)) {
		const initializer = node.getInitializer();

		// Check for 'payload =' declaration
		if (node.getName() === "payload") {
			if (Node.isAsExpression(initializer)) {
				return initializer.getTypeNode();
			}
			return node.getTypeNode();
		}

		// Check for 'await request.json()' assignment, including with type assertion
		if (initializer) {
			if (Node.isAwaitExpression(initializer)) {
				const awaitedExpression = initializer.getExpression();
				if (
					Node.isCallExpression(awaitedExpression) &&
					awaitedExpression.getExpression().getText() === "request.json"
				) {
					return node.getTypeNode();
				}
			} else if (Node.isAsExpression(initializer)) {
				const expression = initializer.getExpression();
				if (Node.isAwaitExpression(expression)) {
					const awaitedExpression = expression.getExpression();
					if (
						Node.isCallExpression(awaitedExpression) &&
						awaitedExpression.getExpression().getText() === "request.json"
					) {
						return initializer.getTypeNode();
					}
				} else if (Node.isObjectLiteralExpression(expression)) {
					// Handle cases like `{} as SomeType`
					return initializer.getTypeNode();
				}
			}
		}
	}
}

function extractErrorDetails(
	node: Node,
	framework: string,
): ErrorDetails<any> | null {
	if (Node.isThrowStatement(node)) {
		return extractFromThrowStatement(node);
	}
	if (Node.isCatchClause(node)) {
		return extractFromCatchClause(node);
	}
	if (Node.isCallExpression(node)) {
		return extractFromCallExpression(node, framework);
	}
	// console.error(node.getKindName(), node.getText());
	return null;
}

function extractFromThrowStatement(
	node: ThrowStatement,
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
	node: CallExpression,
	framework: string,
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

type StatementResult = {
	status: number;
	type: FormattedType;
};

function processTypeNode(node: Node, typeChecker: TypeChecker): FormattedType {
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

function extract_return_statement(
	node: Node,
	typeChecker: TypeChecker,
	spinner: Ora,
): StatementResult | undefined {
	if (Node.isReturnStatement(node)) {
		const expression = node.getExpression();
		if (!expression) {
			spinner.warn(
				`Detected return statement without expression ${node_text_snippet(
					node,
				)}`,
			);
			return;
		}
		const result = process_expression(expression, typeChecker, spinner);
		if (!result || !result.resultsDeclaration) {
			spinner.warn(
				`Unhandled return statement with type (${expression.getKindName()})
			in ${log_node_with_location(node)}`,
			);
			return;
		}
		if (result?.resultsDeclaration) {
			return {
				status: result.status,
				type: processTypeNode(result?.resultsDeclaration, typeChecker),
			};
		}
		spinner.fail(
			`Unhandled return expression
	${log_node_with_location(node)}`,
		);
	}
}

function process_call_expression(
	expression: CallExpression | NewExpression,
	typeChecker: TypeChecker,
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

	const args = expression.getArguments();

	const first_arg = args.at(0);

	if (first_arg) {
		if (
			CallExpression.isCallExpression(first_arg) ||
			NewExpression.isNewExpression(first_arg)
		) {
			return process_call_expression(first_arg, typeChecker, spinner);
		}

		if (Identifier.isIdentifier(first_arg)) {
			result.resultsDeclaration = processReturnIdentifier(
				first_arg,
				typeChecker,
			);
		} else if (StringLiteral) {
			result.resultsDeclaration = first_arg;
		} else if (NumericLiteral.isNumericLiteral(first_arg)) {
			result.status = Number.parseInt(first_arg.getText());
		} else if (PropertyAccessExpression.isPropertyAccessExpression(first_arg)) {
			result.resultsDeclaration = first_arg.getNameNode();
		} else {
			console.error(
				"Unhandled first argument type:",
				first_arg?.getKindName(),
				first_arg?.getText(),
			);
			result.resultsDeclaration = first_arg;
		}
	}

	// console.error(
	// 	"uwu",
	// 	args.map((arg) => arg.getKindName()),
	// 	result.resultsDeclaration?.getText(),
	// );

	const statusArg = args.find((arg) =>
		ObjectLiteralExpression.isObjectLiteralExpression(arg),
	);
	if (
		statusArg &&
		ObjectLiteralExpression.isObjectLiteralExpression(statusArg)
	) {
		const statusProperty = statusArg.getProperty("status");
		if (
			statusProperty &&
			PropertyAssignment.isPropertyAssignment(statusProperty)
		) {
			const initializer = statusProperty.getInitializer();
			if (initializer) {
				const statusValue = Number.parseInt(initializer.getText());
				if (!Number.isNaN(statusValue)) {
					result.status = statusValue;
				}
			}
		}
	}

	// console.log(
	// 	"Returning:",
	// 	result.status,
	// 	result.resultsDeclaration?.getKindName(),
	// );
	return result;
}

function processReturnIdentifier(
	expression: Identifier,
	typeChecker: TypeChecker,
) {
	const symbol = typeChecker.getSymbolAtLocation(expression);
	if (symbol) {
		const declarations = symbol.getDeclarations();
		return declarations.at(0) as Node;
	}
}

function process_expression(
	expression: Node,
	typeChecker: TypeChecker,
	spinner: Ora,
) {
	if (Node.isNewExpression(expression)) {
		return process_call_expression(expression, typeChecker, spinner);
	}
	if (Node.isCallExpression(expression)) {
		// console.error(
		// 	`call expression`,
		// 	expression.getKindName(),
		// 	expression.getText(),
		// );
		return process_call_expression(expression, typeChecker, spinner);
	}
	if (Node.isIdentifier(expression)) {
		return {
			status: 200,
			resultsDeclaration: processReturnIdentifier(expression, typeChecker),
		};
	}
	if (Node.isAsExpression(expression)) {
		console.error("as expression", expression.getExpression().getKindName());
		return process_expression(expression.getExpression(), typeChecker, spinner);
	}
	if (Node.isPropertyAccessExpression(expression)) {
		console.error(
			"property access expression",
			expression.getKindName(),
			expression.getText(),
		);
		return process_expression(expression.getExpression(), typeChecker, spinner);
	}
	if (Node.isAwaitExpression(expression)) {
		return process_expression(expression.getExpression(), typeChecker, spinner);
	}
	console.error("unhandled expression", expression.getKindName());
}

export function extract_endpoint_response(
	node: Node,
	typeChecker: TypeChecker,
	framework: string,
	spinner: Ora,
) {
	const error_node = extractErrorDetails(node, framework);
	if (error_node) {
		return {
			status: error_node.status,
			type: error_node.type_string
				? {
						typeString: error_node.type_string,
					}
				: processTypeNode(error_node.node, typeChecker),
		};
	}

	const result =
		extract_results_declaration(node, typeChecker, spinner) ||
		extract_return_statement(node, typeChecker, spinner);
	if (result) {
		return {
			status: result.status,
			type: result.type,
		};
	}
}

function extract_results_declaration(
	node: Node,
	typeChecker: TypeChecker,
	spinner: Ora,
): StatementResult | undefined {
	if (
		Node.isVariableDeclaration(node) &&
		(node.getName() === "result" || node.getName() === "results")
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
		return {
			status: 200,
			type: processTypeNode(initializer, typeChecker),
		};
	}
}

export function extract_query_parameters(node: Node, typeChecker: TypeChecker) {
	const queryParameters: Record<string, FormattedType> = {};
	const searchParamsVariables = new Set<string>();
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

	if (Node.isCallExpression(node) || Node.isElementAccessExpression(node)) {
		// Detect usage of url.searchParams.get(x) or variable.get(x) or variable[x]
		const expression = node.getExpression();

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
					queryParameters[queryParameterName] = { typeString: paramType };
				}
			}
		} else if (Node.isElementAccessExpression(expression)) {
			const expressionName = expression.getExpression().getText();

			if (searchParamsVariables.has(expressionName)) {
				const argumentExpression = expression.getArgumentExpression();
				if (argumentExpression && Node.isStringLiteral(argumentExpression)) {
					const queryParameterName = argumentExpression.getLiteralText();
					if (!queryParameters[queryParameterName]) {
						queryParameters[queryParameterName] = {};
					}
					const paramType = footprintOfType({
						type: typeChecker.getTypeAtLocation(node),
						node: node,
						typeChecker: typeChecker,
					});
					queryParameters[queryParameterName].typeString = paramType.typeString;
					queryParameters[queryParameterName].imports = paramType.imports;
				}
			}
		}
		return queryParameters;
	}

	if (Node.isVariableDeclaration(node)) {
		// Get the type of the constant when the query string is assigned to it
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
					if (!queryParameters[variableName]) {
						queryParameters[variableName] = {};
					}
					queryParameters[variableName].typeString = variableType.getText();
				}
			} else if (Node.isElementAccessExpression(expression)) {
				const expressionName = expression.getExpression().getText();

				if (searchParamsVariables.has(expressionName)) {
					const variableType = typeChecker.getTypeAtLocation(node);
					const variableName = node.getName();
					if (!queryParameters[variableName]) {
						queryParameters[variableName] = {};
					}
					queryParameters[variableName].typeString = variableType.getText();
				}
			}
		}
	}
}

export function extractPayloadTypeNode(
	allDeclarations: Node[],
): TypeNode | undefined {
	for (const node of allDeclarations) {
		const payload_node = extract_payload_node(node);
		if (payload_node) {
			return payload_node;
		}
	}
}

export function extractReturnType(
	allDeclarations: Node[],
	typeChecker: TypeChecker,
): TypeNode | null {
	for (const node of allDeclarations) {
		if (Node.isReturnStatement(node)) {
			const expression = node.getExpression();
			if (expression) {
				if (
					Node.isCallExpression(expression) ||
					Node.isNewExpression(expression)
				) {
					// Handle json() or new Response() cases
					if (
						expression.getExpression().getText() === "json" ||
						(Node.isNewExpression(expression) &&
							expression.getExpression().getText() === "Response")
					) {
						const argument = expression.getArguments()[0];
						if (argument) {
							return typeChecker.getTypeAtLocation(argument)
								.compilerType as TypeNode;
						}
					}
				} else if (Node.isIdentifier(expression)) {
					// Handle case where a variable is returned
					const symbol = typeChecker.getSymbolAtLocation(expression);
					if (symbol) {
						const declarations = symbol.getDeclarations();
						if (declarations && declarations.length > 0) {
							const declaration = declarations[0];
							if (Node.isVariableDeclaration(declaration)) {
								const type = declaration.getType();
								return type.compilerType as TypeNode;
							}
						}
					}
				}
			}
		} else if (
			Node.isVariableDeclaration(node) &&
			node.getName() === "results"
		) {
			// Handle case where 'results' variable is declared
			return node.getType().compilerType as TypeNode;
		}
	}

	return null;
}
