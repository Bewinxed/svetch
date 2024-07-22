import { Node, type TypeNode, type TypeChecker } from 'ts-morph';

export function extractPayloadTypeNode(
  allDeclarations: Node[]
): TypeNode | null {
  for (const node of allDeclarations) {
    if (Node.isVariableDeclaration(node)) {
      const initializer = node.getInitializer();

      // Check for 'payload =' declaration
      if (node.getName() === 'payload') {
        if (Node.isAsExpression(initializer)) {
          return initializer.getTypeNode() || null;
        }
        return node.getTypeNode() || null;
      }

      // Check for 'await request.json()' assignment, including with type assertion
      if (initializer) {
        if (Node.isAwaitExpression(initializer)) {
          const awaitedExpression = initializer.getExpression();
          if (
            Node.isCallExpression(awaitedExpression) &&
            awaitedExpression.getExpression().getText() === 'request.json'
          ) {
            return node.getTypeNode() || null;
          }
        } else if (Node.isAsExpression(initializer)) {
          const expression = initializer.getExpression();
          if (Node.isAwaitExpression(expression)) {
            const awaitedExpression = expression.getExpression();
            if (
              Node.isCallExpression(awaitedExpression) &&
              awaitedExpression.getExpression().getText() === 'request.json'
            ) {
              return initializer.getTypeNode() || null;
            }
          } else if (Node.isObjectLiteralExpression(expression)) {
            // Handle cases like `{} as SomeType`
            return initializer.getTypeNode() || null;
          }
        }
      }
    }
  }

  // If no payload is found, try to find any variable that uses 'await request.json()'
  for (const node of allDeclarations) {
    if (Node.isVariableDeclaration(node)) {
      const initializer = node.getInitializer();
      if (initializer?.getFullText().includes('await request.json()')) {
        return node.getTypeNode() || null;
      }
    }
  }

  return null;
}

export function extractReturnType(
  allDeclarations: Node[],
  typeChecker: TypeChecker
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
            expression.getExpression().getText() === 'json' ||
            (Node.isNewExpression(expression) &&
              expression.getExpression().getText() === 'Response')
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
      node.getName() === 'results'
    ) {
      // Handle case where 'results' variable is declared
      return node.getType().compilerType as TypeNode;
    }
  }

  return null;
}
