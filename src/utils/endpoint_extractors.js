"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPayloadTypeNode = extractPayloadTypeNode;
exports.extractReturnType = extractReturnType;
var ts_morph_1 = require("ts-morph");
function extractPayloadTypeNode(allDeclarations) {
    for (var _i = 0, allDeclarations_1 = allDeclarations; _i < allDeclarations_1.length; _i++) {
        var node = allDeclarations_1[_i];
        if (ts_morph_1.Node.isVariableDeclaration(node)) {
            var initializer = node.getInitializer();
            // Check for 'payload =' declaration
            if (node.getName() === 'payload') {
                if (ts_morph_1.Node.isAsExpression(initializer)) {
                    return initializer.getTypeNode() || null;
                }
                return node.getTypeNode() || null;
            }
            // Check for 'await request.json()' assignment, including with type assertion
            if (initializer) {
                if (ts_morph_1.Node.isAwaitExpression(initializer)) {
                    var awaitedExpression = initializer.getExpression();
                    if (ts_morph_1.Node.isCallExpression(awaitedExpression) &&
                        awaitedExpression.getExpression().getText() === 'request.json') {
                        return node.getTypeNode() || null;
                    }
                }
                else if (ts_morph_1.Node.isAsExpression(initializer)) {
                    var expression = initializer.getExpression();
                    if (ts_morph_1.Node.isAwaitExpression(expression)) {
                        var awaitedExpression = expression.getExpression();
                        if (ts_morph_1.Node.isCallExpression(awaitedExpression) &&
                            awaitedExpression.getExpression().getText() === 'request.json') {
                            return initializer.getTypeNode() || null;
                        }
                    }
                    else if (ts_morph_1.Node.isObjectLiteralExpression(expression)) {
                        // Handle cases like `{} as SomeType`
                        return initializer.getTypeNode() || null;
                    }
                }
            }
        }
    }
    // If no payload is found, try to find any variable that uses 'await request.json()'
    for (var _a = 0, allDeclarations_2 = allDeclarations; _a < allDeclarations_2.length; _a++) {
        var node = allDeclarations_2[_a];
        if (ts_morph_1.Node.isVariableDeclaration(node)) {
            var initializer = node.getInitializer();
            if (initializer === null || initializer === void 0 ? void 0 : initializer.getFullText().includes('await request.json()')) {
                return node.getTypeNode() || null;
            }
        }
    }
    return null;
}
function extractReturnType(allDeclarations, typeChecker) {
    for (var _i = 0, allDeclarations_3 = allDeclarations; _i < allDeclarations_3.length; _i++) {
        var node = allDeclarations_3[_i];
        if (ts_morph_1.Node.isReturnStatement(node)) {
            var expression = node.getExpression();
            if (expression) {
                if (ts_morph_1.Node.isCallExpression(expression) ||
                    ts_morph_1.Node.isNewExpression(expression)) {
                    // Handle json() or new Response() cases
                    if (expression.getExpression().getText() === 'json' ||
                        (ts_morph_1.Node.isNewExpression(expression) &&
                            expression.getExpression().getText() === 'Response')) {
                        var argument = expression.getArguments()[0];
                        if (argument) {
                            return typeChecker.getTypeAtLocation(argument)
                                .compilerType;
                        }
                    }
                }
                else if (ts_morph_1.Node.isIdentifier(expression)) {
                    // Handle case where a variable is returned
                    var symbol = typeChecker.getSymbolAtLocation(expression);
                    if (symbol) {
                        var declarations = symbol.getDeclarations();
                        if (declarations && declarations.length > 0) {
                            var declaration = declarations[0];
                            if (ts_morph_1.Node.isVariableDeclaration(declaration)) {
                                var type = declaration.getType();
                                return type.compilerType;
                            }
                        }
                    }
                }
            }
        }
        else if (ts_morph_1.Node.isVariableDeclaration(node) &&
            node.getName() === 'results') {
            // Handle case where 'results' variable is declared
            return node.getType().compilerType;
        }
    }
    return null;
}
