import type { ErrorDetails } from "../../../types/core.js";
import { mock_node } from "../../../utils/helpers/mock.js";
import { Node, SyntaxKind, type CallExpression } from "ts-morph";

export function extract_kit_error(
	node: CallExpression,
	// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
): ErrorDetails<any> | null {
	const expression = node.getExpression();
	if (Node.isIdentifier(expression) && expression.getText() === "error") {
		const [status, initializer] = node.getArguments();
		if (Node.isNumericLiteral(status) && Node.isStringLiteral(initializer)) {
			// biome-ignore lint/style/noNonNullAssertion: This is a mock node
			const updated_node = mock_node(
				node,
				`
            const error = {
                message: '${initializer.getLiteralValue()}'
            }
            `,
			).getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression)!;
			return {
				status: status.getLiteralValue(),
				type_string: `
                {
                    message: '${initializer.getLiteralValue()}'
                }
                `,
				node: updated_node,
			};
		}
	}
	return null;
}
