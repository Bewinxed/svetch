"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
var commentParser = require("comment-parser");
var fs = require("node:fs");
var json_schema_to_zod_1 = require("json-schema-to-zod");
var os = require("node:os");
var path = require("node:path");
var ts_morph_1 = require("ts-morph");
var TJS = require("typescript-json-schema");
var uuid_1 = require("uuid");
var svelte_codegen_1 = require("./svelte-codegen");
var logger_1 = require("./utils/logger");
var endpoint_extractors_1 = require("./utils/endpoint_extractors");
var workingDir = (_a = process.env.PWD) !== null && _a !== void 0 ? _a : process.cwd();
var separator = '--------------------------------------';
// process.on('SIGUSR2', function () {
//   const snapshotFile = '/path/to/your/project/heap-' + Date.now() + '.heapsnapshot';
//   heapdump.writeSnapshot(snapshotFile, (err) => {
//     if (err) console.error(err);
//     else console.log(`Heap dump written to ${snapshotFile}`);
//   });
// });
// this won't send if you disable telemetry
var telemetryPayload = {
    _id: (0, uuid_1.v4)(),
    // read from svelte.config.js
    project: workingDir.split('/').pop(),
    timestamp: Date.now(),
    data: {
        session_id: (0, uuid_1.v4)(),
        script_name: 'svetch',
        operating_system: os.platform(),
        node_version: process.version,
        npm_version: process.env.npm_package_version || 'unknown',
        encountered_errors: false,
        error_messages: [],
        processed_files_count: 0,
        generated_lines_of_code: 0,
        processed_endpoints: {
            POST: 0,
            GET: 0,
            PUT: 0,
            PATCH: 0,
            DELETE: 0
        }
    }
};
var _b = {}, tsconfig = _b.tsconfig, framework = _b.framework, input = _b.input, out = _b.out, logLevel = _b.logLevel, filter = _b.filter, docs = _b.docs, staticFolder = _b.staticFolder, telemetry = _b.telemetry;
var project = new ts_morph_1.Project({
    compilerOptions: { allowJs: true },
    tsConfigFilePath: tsconfig
});
var typeChecker = project.getTypeChecker();
var outputPath;
var schemaOutputPath;
var docsOutputPath;
var endpoints = new Map();
var actions = {};
var importMap = {};
function processTypeNode(node) {
    var memoized = new WeakMap();
    function processInner(innerNode) {
        if (memoized.has(innerNode)) {
            return memoized.get(innerNode);
        }
        var result;
        if (ts_morph_1.Node.isTypeReference(innerNode) ||
            ts_morph_1.Node.hasStructure(innerNode)
        // typeText.includes('Prisma')
        ) {
            result = (0, svelte_codegen_1.footprintOfType)({
                file: innerNode.getSourceFile(),
                type: innerNode.getType(),
                node: innerNode
            });
        }
        else if (ts_morph_1.Node.isObjectLiteralExpression(innerNode)) {
            var processedObject = processObjectLiteral(innerNode);
            result = { typeRepresentation: processedObject, imports: new Set() };
        }
        else {
            result = { typeRepresentation: innerNode.getText(), imports: new Set() };
        }
        memoized.set(innerNode, result);
        return result;
    }
    return processInner(node);
}
function processObjectLiteral(node) {
    var inferredTypes = {};
    for (var _i = 0, _a = node.getProperties(); _i < _a.length; _i++) {
        var property = _a[_i];
        if (ts_morph_1.Node.isPropertyAssignment(property)) {
            var initializer = property.getInitializer();
            var keyname = getPropertyKeyName(property);
            if (!initializer || !keyname)
                continue;
            inferredTypes[keyname] = getPropertyType(property, initializer, node);
        }
    }
    return JSON.stringify(inferredTypes);
}
function getPropertyKeyName(property) {
    try {
        var computedName = property.getFirstChildByKind(ts_morph_1.SyntaxKind.ComputedPropertyName);
        if (computedName) {
            var identifier = computedName.getFirstChildByKind(ts_morph_1.SyntaxKind.Identifier);
            return "".concat(identifier === null || identifier === void 0 ? void 0 : identifier.getText(), ": string");
        }
        return property.getName();
    }
    catch (e) {
        console.error('Error getting property name:', e);
        return property.getName();
    }
}
function getPropertyType(property, initializer, node) {
    var _a;
    if (apiParams[node.getSourceFile().getFilePath()] &&
        apiParams[node.getSourceFile().getFilePath()]
            .getText()
            .includes(initializer === null || initializer === void 0 ? void 0 : initializer.getText().replace('params.', ''))) {
        return 'string';
    }
    if (ts_morph_1.Node.isPropertyAccessExpression(initializer)) {
        return typeChecker.getTypeAtLocation(property).getText() || 'any';
    }
    return ((_a = typeChecker.getTypeAtLocation(initializer)) === null || _a === void 0 ? void 0 : _a.getText()) || 'any';
}
function extractPathParams(path) {
    var params = path.match(/:([^/]+)/g);
    var pathParams = {};
    if (params) {
        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
            var param = params_1[_i];
            var paramName = param.slice(1);
            pathParams[paramName] = 'string';
        }
    }
    return pathParams;
}
function extractQueryParameters(declaration, typeChecker) {
    var queryParameters = {};
    var searchParamsVariables = new Set();
    declaration.forEachDescendant(function (node) {
        // Detect any declaration of url.searchParams and store the variable name
        if (ts_morph_1.Node.isVariableDeclaration(node)) {
            var initializer = node.getInitializer();
            if (initializer && ts_morph_1.Node.isPropertyAccessExpression(initializer)) {
                var expression = initializer.getExpression();
                var property = initializer.getName();
                if (expression.getText() === 'url' && property === 'searchParams') {
                    var variableName = node.getName();
                    searchParamsVariables.add(variableName);
                }
            }
        }
        // Detect usage of url.searchParams.get(x) or variable.get(x) or variable[x]
        if (ts_morph_1.Node.isCallExpression(node) || ts_morph_1.Node.isElementAccessExpression(node)) {
            var expression = node.getExpression();
            if (ts_morph_1.Node.isPropertyAccessExpression(expression)) {
                var object = expression.getExpression();
                var property = expression.getName();
                if ((object.getText() === 'url.searchParams' && property === 'get') ||
                    (searchParamsVariables.has(object.getText()) && property === 'get')) {
                    var args = node.getArguments();
                    if (args.length > 0 && ts_morph_1.Node.isStringLiteral(args[0])) {
                        var queryParameterName = args[0].getLiteralText();
                        var paramType = typeChecker
                            .getTypeAtLocation(node.getParent())
                            .getText();
                        queryParameters[queryParameterName] = paramType;
                    }
                }
            }
            else if (ts_morph_1.Node.isElementAccessExpression(expression)) {
                var expressionName = expression.getExpression().getText();
                if (searchParamsVariables.has(expressionName)) {
                    var argumentExpression = expression.getArgumentExpression();
                    if (argumentExpression && ts_morph_1.Node.isStringLiteral(argumentExpression)) {
                        var queryParameterName = argumentExpression.getLiteralText();
                        var paramType = typeChecker
                            .getTypeAtLocation(node.getParent())
                            .getText();
                        queryParameters[queryParameterName] = paramType;
                    }
                }
            }
        }
        // Get the type of the constant when the query string is assigned to it
        if (ts_morph_1.Node.isVariableDeclaration(node)) {
            var initializer = node.getInitializer();
            if (initializer &&
                (ts_morph_1.Node.isCallExpression(initializer) ||
                    ts_morph_1.Node.isElementAccessExpression(initializer))) {
                var expression = initializer.getExpression();
                if (ts_morph_1.Node.isPropertyAccessExpression(expression)) {
                    var object = expression.getExpression();
                    var property = expression.getName();
                    if ((object.getText() === 'url.searchParams' && property === 'get') ||
                        (searchParamsVariables.has(object.getText()) && property === 'get')) {
                        var variableType = typeChecker.getTypeAtLocation(node);
                        var variableName = node.getName();
                        queryParameters[variableName] = variableType.getText();
                    }
                }
                else if (ts_morph_1.Node.isElementAccessExpression(expression)) {
                    var expressionName = expression.getExpression().getText();
                    if (searchParamsVariables.has(expressionName)) {
                        var variableType = typeChecker.getTypeAtLocation(node);
                        var variableName = node.getName();
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
function warnIfResultsNotUsedInResponse(declaration) {
    var _a, _b;
    var resultsName = 'results';
    var isResultsUsedInResponse = false;
    declaration.forEachDescendant(function (node) {
        if (ts_morph_1.Node.isCallExpression(node)) {
            var expression = node.getExpression();
            // Check if the call expression is 'json' or 'Response'
            if (ts_morph_1.Node.isIdentifier(expression) &&
                (expression.getText() === 'json' || expression.getText() === 'Response')) {
                // Check if 'results' is used in the arguments
                var args = node.getArguments();
                for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                    var arg = args_1[_i];
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
        logger_1.log.warn(3, "\t\t[WARN]: 'results' is not used in a 'json' or 'Response' function call in\n\t\t\t\t ".concat((_b = (_a = declaration.getFunctions()) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.getName()));
    }
}
function extractCatchThrowDetails(node) {
    if (ts_morph_1.Node.isCatchClause(node)) {
        // log types of all children
        var throwBlock = node.getFirstChildByKind(ts_morph_1.SyntaxKind.Block);
        if (!throwBlock) {
            return null;
        }
        var throwStatement = throwBlock.getFirstChildByKind(ts_morph_1.SyntaxKind.ThrowStatement);
        if (throwStatement) {
            var callExpression = throwStatement.getFirstChildByKind(ts_morph_1.SyntaxKind.CallExpression);
            if (callExpression && ts_morph_1.Node.isCallExpression(callExpression)) {
                var args = callExpression.getArguments();
                if (args.length >= 2 &&
                    ts_morph_1.Node.isNumericLiteral(args[0]) &&
                    ts_morph_1.Node.isTemplateExpression(args[1])) {
                    var type = 'unknown';
                    var catchClause = node;
                    var errorVariableDeclaration = catchClause.getVariableDeclaration();
                    if (errorVariableDeclaration) {
                        var errorVariableType = errorVariableDeclaration.getType();
                        if (errorVariableType) {
                            type = errorVariableType.getText();
                        }
                    }
                    return {
                        status: args[0].getText(),
                        message: args[1].getText().replace('${e}', type),
                        type: type
                    };
                }
            }
        }
    }
    if (ts_morph_1.Node.isThrowStatement(node)) {
        var callExpression = node.getFirstChildByKind(ts_morph_1.SyntaxKind.CallExpression);
        if (callExpression && ts_morph_1.Node.isCallExpression(callExpression)) {
            var args = callExpression.getArguments();
            if (args.length >= 2 &&
                ts_morph_1.Node.isNumericLiteral(args[0]) &&
                ts_morph_1.Node.isStringLiteral(args[1])) {
                var statusCode = args[0].getText();
                var message = args[1].getText();
                return {
                    status: statusCode,
                    message: message,
                    type: 'unknown'
                };
            }
        }
    }
    return null;
}
var apiParams = {};
function extractRootDirTypes(declaration) {
    var _a;
    if (framework === 'sveltekit') {
        var requestEventTypePath = path.resolve(workingDir, declaration
            .getSourceFile()
            .getFilePath()
            .replace(workingDir, '.svelte-kit/types')
            .replace('/+server.ts', '/$types.d.ts'));
        if (!fs.existsSync(requestEventTypePath)) {
            logger_1.log.warn(3, "No $types.d.ts found, Make sure you \"npm run dev\" at least once, or route params will not be typed");
            return;
        }
        logger_1.log.info(3, "[SVELTEKIT]: Looking for $types.d.ts");
        if (!requestEventTypePath) {
            logger_1.log.error(3, "No generated $types.d.ts found, make sure you run 'npm run dev' once at least...");
            return;
        }
        var routeParamsType = (_a = project
            .addSourceFileAtPath(requestEventTypePath)) === null || _a === void 0 ? void 0 : _a.getTypeAlias('RouteParams');
        if (!routeParamsType) {
            logger_1.log.error(3, "No RequestEvent found in types.d.ts, make sure you run 'npm run dev' once at least...");
            return;
        }
        var routeParamTypeNode = routeParamsType.getTypeNode();
        if (routeParamTypeNode) {
            apiParams[declaration.getSourceFile().getFilePath()] = routeParamTypeNode;
        }
        return declaration;
    }
}
function tryParseJsDocComment(comment) {
    try {
        return commentParser.parse(comment);
    }
    catch (e) {
        logger_1.log.error(3, "Failed to parse comment: ".concat(comment));
        return null;
    }
}
function processFunctionDeclaration(declaration) {
    var _a;
    var file = declaration.getSourceFile();
    var methodType = declaration.getName();
    if (methodType !== 'GET' &&
        methodType !== 'POST' &&
        methodType !== 'PUT' &&
        methodType !== 'PATCH' &&
        methodType !== 'DELETE') {
        logger_1.log.warn(2, "Unsupported method type ".concat(methodType, " in ").concat(file.getFilePath()));
        return;
    }
    var filePath = declaration.getSourceFile().getFilePath();
    var apiPath = processFilePath(filePath);
    var endpoint = endpoints.get(apiPath);
    if (!endpoint) {
        endpoint = new Map();
        endpoints.set(apiPath, endpoint);
    }
    logger_1.log.header(2, "".concat(methodType));
    var allDeclarations = getAllDeclarations(declaration);
    if (!allDeclarations || allDeclarations.length === 0) {
        logger_1.log.error(3, "No declarations found");
        return;
    }
    if (framework === 'sveltekit') {
        extractRootDirTypes(declaration);
    }
    var payloadNode = (0, endpoint_extractors_1.extractPayloadTypeNode)(allDeclarations);
    if (payloadNode) {
        logger_1.log.success(3, 'Detected payload declaration');
    }
    else {
        logger_1.log.warn(3, "No payload declaration found for ".concat(methodType, " method in ").concat(file.getFilePath()));
    }
    var jsdoc = extractJSDoc(declaration);
    var method = endpoint.get(methodType);
    if (!method) {
        method = {};
        endpoint.set(methodType, method);
    }
    if (jsdoc.length > 0 && ((_a = jsdoc[0]) === null || _a === void 0 ? void 0 : _a[0])) {
        method.docs = commentParser.stringify(jsdoc[0][0]);
    }
    var _b = processDeclarations(allDeclarations, method), status = _b.status, resultsDeclaration = _b.resultsDeclaration, addedResponses = _b.addedResponses;
    if (!resultsDeclaration) {
        logger_1.log.warn(2, "No results declaration found for ".concat(methodType, " method in ").concat(file.getFilePath()));
    }
    if (['POST', 'PUT', 'PATCH'].includes(methodType) && !payloadNode) {
        logger_1.log.warn(2, "No payload declaration found for ".concat(methodType, " method in ").concat(file.getFilePath()));
    }
    endpoint.set(methodType, method);
    var pathParam = extractPathParams(apiPath);
    var queryParams = extractQueryParameters(declaration, typeChecker);
    method.parameters = {
        path: pathParam,
        query: queryParams,
        body: payloadNode ? processTypeNode(payloadNode) : undefined
    };
}
// Helper functions
function processFilePath(filePath) {
    return filePath
        .replace(workingDir, '')
        .replace('/src/routes', '')
        .replace('/+server.ts', '')
        .replace('/', '')
        .replace(/\[([^\]]+)\]/g, ':$1');
}
function getAllDeclarations(declaration) {
    var _a;
    return declaration instanceof ts_morph_1.FunctionDeclaration
        ? declaration.getDescendants()
        : (_a = declaration.getInitializer()) === null || _a === void 0 ? void 0 : _a.getDescendants();
}
function logPayloadDetection(payloadNode, methodType, file) {
    if (payloadNode) {
        logger_1.log.success(3, 'Detected payload declaration');
    }
    else {
        logger_1.log.warn(3, "No payload declaration found for ".concat(methodType, " method in ").concat(file.getFilePath()));
    }
}
function extractJSDoc(declaration) {
    return declaration
        .getDescendantStatements()
        .flatMap(function (statement) { return statement.getLeadingCommentRanges(); })
        .map(function (range) { return range.getText(); })
        .map(function (comment) { return tryParseJsDocComment(comment); })
        .filter(function (jsdoc) {
        var _a;
        return jsdoc &&
            jsdoc.length > 0 &&
            ((_a = jsdoc[0]) === null || _a === void 0 ? void 0 : _a.tags.some(function (tag) { return tag.tag === 'svetch'; }));
    });
}
function processDeclarations(allDeclarations, method) {
    var status = 200;
    var resultsDeclaration;
    var addedResponses = new Set();
    // biome-ignore lint/complexity/noForEach: <explanation>
    allDeclarations.forEach(function (node) {
        if (ts_morph_1.Node.isReturnStatement(node)) {
            var result = processReturnStatement(node, status, resultsDeclaration);
            if (result) {
                (status = result.status, resultsDeclaration = result.resultsDeclaration);
            }
        }
        else if (ts_morph_1.Node.isVariableDeclaration(node) &&
            node.getName() === 'results') {
            resultsDeclaration = processReturnVariable(resultsDeclaration, node);
        }
        if (resultsDeclaration) {
            var processedResponse = processTypeNode(resultsDeclaration);
            var responseString = JSON.stringify(processedResponse);
            if (!addedResponses.has(responseString)) {
                if (!method.responses) {
                    method.responses = {};
                }
                if (!method.responses[status]) {
                    method.responses[status] = [];
                }
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                method.responses[status].push(processedResponse);
                addedResponses.add(responseString);
            }
        }
        processThrowDetails(node, method);
    });
    return { status: status, resultsDeclaration: resultsDeclaration, addedResponses: addedResponses };
}
function processReturnStatement(node, status, resultsDeclaration) {
    var expression = node.getExpression();
    if (!expression) {
        logger_1.log.error(3, 'Detected return statement without expression');
        return null;
    }
    if (!node.getText().includes('json') &&
        !node.getText().includes('Response')) {
        logger_1.log.error(3, "Detected return statement (".concat(expression.getText(), ") without json() or new Response() constructor, Skipping..."));
        return null;
    }
    if (ts_morph_1.Node.isCallExpression(expression) || ts_morph_1.Node.isNewExpression(expression)) {
        return processReturnExpression(expression, status, resultsDeclaration);
    }
    if (ts_morph_1.Node.isIdentifier(expression)) {
        return {
            status: status,
            resultsDeclaration: processReturnIdentifier(expression, resultsDeclaration)
        };
    }
    logger_1.log.warn(3, "Unhandled return statement with type (".concat(expression.getKindName(), "), in ").concat(node
        .getSourceFile()
        .getFilePath(), "\n\t\tplease report this to the developer\n\t------\n\t\t").concat(node.getText(), "\n\t\t------\n"));
    return null;
}
function processThrowDetails(node, method) {
    var throwDetails = extractCatchThrowDetails(node);
    if (throwDetails) {
        if (!method.errors) {
            method.errors = {};
        }
        if (!method.errors[throwDetails.status]) {
            method.errors[throwDetails.status] = [];
        }
        method.errors[throwDetails.status].push({
            message: throwDetails.message
        });
    }
}
function processReturnVariable(resultsDeclaration, node) {
    resultsDeclaration = node.getTypeNode();
    if (!resultsDeclaration) {
        var initializer = node.getInitializer();
        if (initializer) {
            var expression = initializer;
            // if the initializer is an await expression, get its expression
            if (ts_morph_1.Node.isAwaitExpression(initializer)) {
                expression = initializer.getExpression();
            }
            if (ts_morph_1.Node.isCallExpression(expression)) {
                // get the function
                var functionExpression = expression.getExpression();
                // log it
                logger_1.log.debug(4, "function", functionExpression.getText());
                // log the return type
                logger_1.log.debug(4, "return type", functionExpression.getType().getText());
                // get the type of the initializer
                var type = expression.getReturnType();
                // print the type
                logger_1.log.debug(4, "return type", type.getText());
            }
        }
    }
    return resultsDeclaration;
}
function processReturnIdentifier(expression, resultsDeclaration) {
    logger_1.log.success(3, "Detected return statement with identifier expression:\n\t\t---\n\t\t".concat(expression === null || expression === void 0 ? void 0 : expression.getText(), "\n\t\t---\n"));
    var symbol = typeChecker.getSymbolAtLocation(expression);
    if (symbol) {
        var declarations = symbol.getDeclarations();
        if (declarations) {
            resultsDeclaration = declarations[0];
        }
    }
    return resultsDeclaration;
}
function processFailExpression(expression, status, resultsDeclaration) {
    // process fail(401, {...body}), first argument is the status code, second is the body
    var args = expression.getArguments();
    if (args.length > 0) {
        var arg = args.find(function (arg) { return arg.getKind() == ts_morph_1.SyntaxKind.NumericLiteral; });
        if (arg) {
            status = parseInt(arg.getText());
        }
    }
    if (args.length > 1) {
        var arg = args.find(function (arg) { return arg.getKind() == ts_morph_1.SyntaxKind.ObjectLiteralExpression; });
        if (arg) {
            var properties = arg.getProperties();
            if (properties.length > 0) {
                var property = properties[0];
                var initializer = property.getInitializer();
                if (initializer) {
                    resultsDeclaration = initializer;
                }
            }
        }
    }
    return { status: status, resultsDeclaration: resultsDeclaration };
}
function processReturnExpression(expression, status, resultsDeclaration) {
    var _a, _b;
    logger_1.log.success(3, "Detected return statement with expression:\n\t\t---\n\t\t".concat(expression === null || expression === void 0 ? void 0 : expression.getText(), "\n\t\t---\n"));
    var args = expression.getArguments();
    // get the second argument, which is the Response init object, then get the status property
    if (args.length > 1) {
        var arg = args.find(function (arg) { return arg.getKind() === ts_morph_1.SyntaxKind.ObjectLiteralExpression; });
        if (arg) {
            logger_1.log.warn(4, "Args: ".concat(arg
                .getChildren()
                .map(function (arg) { return arg.getText(); })
                .join(', ')));
            var statusProp = (_a = arg
                .asKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)) === null || _a === void 0 ? void 0 : _a.getProperties().find(function (child) {
                return child.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment &&
                    child.getText().includes('status');
            });
            if (statusProp) {
                var statusPropValue = statusProp
                    .getChildren()
                    .find(function (child) { return child.getKind() === ts_morph_1.SyntaxKind.NumericLiteral; });
                if (statusPropValue) {
                    status = parseInt(statusPropValue.getText());
                }
            }
        }
    }
    if (args.length > 0) {
        var arg = args.at(0);
        if ((arg === null || arg === void 0 ? void 0 : arg.getKind()) === ts_morph_1.SyntaxKind.Identifier) {
            var symbol = typeChecker.getSymbolAtLocation(arg);
            if (symbol) {
                var declarations = symbol.getDeclarations();
                if (declarations) {
                    resultsDeclaration = declarations[0];
                    if ((_b = declarations
                        .at(0)) === null || _b === void 0 ? void 0 : _b.getFirstDescendantByKind(ts_morph_1.SyntaxKind.MethodDeclaration)) {
                        logger_1.log.error(3, "Found method declaration, These are unsupported at the moment, but you can report it in github, ".concat(declarations[0].getText()));
                        // process.exit()
                        // set as unknown type
                        return {
                            status: status,
                            resultsDeclaration: undefined
                        };
                    }
                    logger_1.log.success(4, 'Found (results = ) declaration:', resultsDeclaration.getText().slice(0, 20));
                }
            }
        }
        else if ((arg === null || arg === void 0 ? void 0 : arg.getKind()) === ts_morph_1.SyntaxKind.ObjectLiteralExpression) {
            logger_1.log.success(4, 'Found Object results declaration:', arg.getText());
            resultsDeclaration = arg;
        }
        else {
            if (arg === null || arg === void 0 ? void 0 : arg.getFirstDescendantByKind(ts_morph_1.SyntaxKind.MethodDeclaration)) {
                logger_1.log.error(3, "Found method declaration, These are unsupported at the moment, but you can report it in github, ".concat(arg.getText()));
                return {
                    status: status,
                    resultsDeclaration: undefined
                };
            }
            resultsDeclaration = arg;
            logger_1.log.warn(4, "Unhandled return statement, please report this to the developer, ".concat(arg === null || arg === void 0 ? void 0 : arg.getText(), ", of type ").concat(arg === null || arg === void 0 ? void 0 : arg.getKindName()));
        }
    }
    return { status: status, resultsDeclaration: resultsDeclaration };
}
function processTypeDeclaration(declaration) {
    var file = declaration.getSourceFile();
    // Add the original logic for handling TypeAliasDeclaration here
    // based on your previous code.
    var filePath = declaration.getSourceFile().getFilePath();
    var apiPath = filePath
        .slice(filePath.indexOf('api/') + 4, filePath.lastIndexOf('/'))
        .replace(/\[\w+\]/g, ':$&')
        .replace(/\[|\]/g, '');
    if (!endpoints[apiPath]) {
        endpoints[apiPath] = {};
    }
    var typeNode = declaration.getTypeNodeOrThrow();
    var methodType = declaration.getName().replace('_', '').toUpperCase();
    if (methodType !== 'GET' &&
        methodType !== 'POST' &&
        methodType !== 'PUT' &&
        methodType !== 'PATCH' &&
        methodType !== 'DELETE') {
        return;
    }
    init_endpoint({
        path: apiPath,
        method: 'GET'
    });
    if (!endpoints[apiPath][methodType]) {
        throw new Error("Docs not set for ".concat(apiPath, " ").concat(methodType));
    }
    var typeArguments = typeNode.getTypeArguments();
    var pathParam = processTypeNode(typeArguments[0]);
    var queryOrBodyParam = processTypeNode(typeArguments[1]);
    if (methodType === 'GET' || methodType === 'DELETE') {
        endpoints[apiPath][methodType]['parameters'] = {
            path: pathParam,
            query: queryOrBodyParam
        };
    }
    else {
        // for 'PUT', 'POST', and 'PATCH', always assign `query` to `undefined`
        endpoints[apiPath][methodType]['parameters'] = {
            path: pathParam,
            body: queryOrBodyParam,
            query: undefined
        };
    }
    if (!endpoints[apiPath][methodType]['responses']) {
        endpoints[apiPath][methodType]['responses'] = {};
    }
    var processedTypeNode = processTypeNode(typeArguments[typeArguments.length - 1]);
    endpoints[apiPath][methodType]['responses'][200] = processedTypeNode;
    // collect all imported types
    file
        .getImportDeclarations()
        .forEach(function (importDeclaration) {
        importDeclaration.getNamedImports().forEach(function (namedImport) {
            importMap[namedImport.getName()] =
                importDeclaration.getModuleSpecifierValue();
        });
    });
}
function processActionsDeclaration(declaration) {
    var file = declaration.getSourceFile();
    // Add the original logic for handling TypeAliasDeclaration here
    // based on your previous code.
    var filePath = declaration.getSourceFile().getFilePath();
    var apiPath = filePath
        .slice(filePath.indexOf('api/') + 4, filePath.lastIndexOf('/'))
        .replace(/\[\w+\]/g, ':$&')
        .replace(/\[|\]/g, '');
    if (!actions[apiPath]) {
        actions[apiPath] = {};
    }
    var typeNode = declaration.getTypeNodeOrThrow();
    var methodType = 'ACTION';
    if (!actions[apiPath][methodType]) {
        actions[apiPath][methodType] = {};
    }
    var objectLiteral = declaration.getFirstChildByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    if (!objectLiteral) {
        logger_1.log.warn(2, "No object literal found for ".concat(apiPath));
        return;
    }
    // process each action inside the declaration
    objectLiteral.forEachDescendant(function (node) {
        var _a, _b;
        var _c, _d, _e, _f, _g;
        if (node.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment) {
            var actionName = (_c = node.getSymbol()) === null || _c === void 0 ? void 0 : _c.getName();
            var payloadStatement = (_g = (_f = (_e = (_d = node
                .getFirstDescendantByKind(ts_morph_1.SyntaxKind.ArrowFunction)) === null || _d === void 0 ? void 0 : _d.getFirstDescendantByKind(ts_morph_1.SyntaxKind.Block)) === null || _e === void 0 ? void 0 : _e.getFirstDescendantByKind(ts_morph_1.SyntaxKind.SyntaxList)) === null || _f === void 0 ? void 0 : _f.getChildrenOfKind(ts_morph_1.SyntaxKind.VariableStatement).find(function (child) {
                var _a;
                var name = (_a = child
                    .getFirstDescendantByKind(ts_morph_1.SyntaxKind.Identifier)) === null || _a === void 0 ? void 0 : _a.getText();
                if (name === 'payload') {
                    logger_1.log.success(3, "Detected payload declaration");
                    return true;
                }
                return false;
            })) === null || _g === void 0 ? void 0 : _g.getFirstDescendantByKind(ts_morph_1.SyntaxKind.Identifier);
            if (!payloadStatement) {
                logger_1.log.warn(2, "No payload declaration found for ".concat(apiPath, ".").concat(actionName));
                return;
            }
            var payloadType = typeChecker
                .getTypeAtLocation(payloadStatement)
                .getText();
            if (!actions[apiPath][methodType][actionName]) {
                actions[apiPath][methodType][actionName] = {
                    parameters: {
                        path: {},
                        query: {},
                        body: {}
                    },
                    responses: {},
                    errors: {}
                };
            }
            actions[apiPath][methodType][actionName]['parameters']['body'] =
                payloadType;
            var status_1 = 200;
            var resultsDeclaration = void 0;
            var addedResponses = new Set();
            // convert below to for...of
            for (var _i = 0, _h = node.getDescendants(); _i < _h.length; _i++) {
                var subnode = _h[_i];
                if (ts_morph_1.Node.isReturnStatement(subnode)) {
                    var expression = subnode.getExpression();
                    if (!expression) {
                        logger_1.log.error(3, 'Detected return statement without expression');
                        return;
                    }
                    if (subnode.getText().includes('fail')) {
                        logger_1.log.error(3, 'Detected return statement with fail');
                        (_a = processFailExpression(expression, status_1, resultsDeclaration), status_1 = _a.status, resultsDeclaration = _a.resultsDeclaration);
                        if (resultsDeclaration) {
                            var processedResponse = processTypeNode(resultsDeclaration);
                            if (!actions[apiPath][methodType][actionName]['errors']) {
                                actions[apiPath][methodType][actionName]['errors'] = {};
                            }
                            if (!actions[apiPath][methodType][actionName]['errors'][status_1]) {
                                actions[apiPath][methodType][actionName]['errors'][status_1] = [];
                            }
                            actions[apiPath][methodType][actionName]['errors'][status_1].push({
                                message: processedResponse
                            });
                            addedResponses.add(JSON.stringify(processedResponse));
                        }
                        return;
                    }
                    // if it's a return statement with an expression, skip it
                    if ((expression && ts_morph_1.Node.isCallExpression(expression)) ||
                        ts_morph_1.Node.isNewExpression(expression)) {
                        (_b = processReturnExpression(expression, status_1, resultsDeclaration), status_1 = _b.status, resultsDeclaration = _b.resultsDeclaration);
                    }
                    else if (expression && ts_morph_1.Node.isIdentifier(expression)) {
                        resultsDeclaration = processReturnIdentifier(expression, resultsDeclaration);
                    }
                    else if (expression && ts_morph_1.Node.isObjectLiteralExpression(expression)) {
                        resultsDeclaration = expression;
                    }
                    else {
                        logger_1.log.warn(3, "Unhandled return statement with type (".concat(expression.getKindName(), "), in ").concat(subnode
                            .getSourceFile()
                            .getFilePath(), "\n\t\tplease report this to the developer\n\t------\n\t\t").concat(subnode.getText(), "\n\t\t------\n"));
                    }
                }
                else if (ts_morph_1.Node.isVariableDeclaration(subnode) &&
                    subnode.getName() === 'results') {
                    resultsDeclaration = processReturnVariable(resultsDeclaration, subnode);
                }
                if (!actions[apiPath][methodType][actionName]['responses'][status_1]) {
                    actions[apiPath][methodType][actionName]['responses'][status_1] = [];
                }
                if (resultsDeclaration) {
                    var processedResponse = processTypeNode(resultsDeclaration);
                    if (!addedResponses.has(JSON.stringify(processedResponse))) {
                        actions[apiPath][methodType][actionName]['responses'][status_1].push(processedResponse);
                        addedResponses.add(JSON.stringify(processedResponse));
                    }
                }
            }
        }
    });
}
function processFiles() {
    var processedFiles = new Set();
    for (var _i = 0, _a = project.getSourceFiles(); _i < _a.length; _i++) {
        var file = _a[_i];
        var filePath = file.getFilePath();
        if (processedFiles.has(filePath))
            continue;
        processedFiles.add(filePath);
        telemetryPayload.data.processed_files_count += 1;
        logger_1.log.header(1, "\u2318  Processing: ".concat(filePath.replace(workingDir, '')));
        for (var _b = 0, _c = file.getExportedDeclarations().values(); _b < _c.length; _b++) {
            var declarationsArray = _c[_b];
            for (var _d = 0, declarationsArray_1 = declarationsArray; _d < declarationsArray_1.length; _d++) {
                var declaration = declarationsArray_1[_d];
                if (isValidDeclaration(declaration)) {
                    processDeclaration(file, declaration);
                }
            }
        }
    }
}
function isValidDeclaration(declaration) {
    var validNames = [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        '_Get',
        '_Post',
        '_Put',
        '_Patch',
        '_Delete',
        'actions'
    ];
    return ((declaration instanceof ts_morph_1.FunctionDeclaration ||
        declaration instanceof ts_morph_1.VariableDeclaration ||
        declaration instanceof ts_morph_1.TypeAliasDeclaration) &&
        validNames.includes(declaration.getName()));
}
function processDeclaration(file, declaration) {
    var declarationName = declaration.getName();
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(declarationName)) {
        processFunctionDeclaration(declaration);
    }
    else if (['_Get', '_Post', '_Put', '_Patch', '_Delete'].includes(declarationName)) {
        processTypeDeclaration(declaration);
    }
    else if (declarationName === 'actions') {
        processActionsDeclaration(declaration);
    }
}
var output = '';
var actionOutput = '';
var generateApiTypes = function (endpoints) {
    var _a, _b;
    var imports = new Set();
    var output = 'export interface APIPaths {\n';
    for (var _i = 0, endpoints_1 = endpoints; _i < endpoints_1.length; _i++) {
        var _c = endpoints_1[_i], apiPath = _c[0], methodMap = _c[1];
        var formattedPath = apiPath.replace(/^\//, '').replace(/\//g, '.');
        output += "  '".concat(formattedPath, "': {\n");
        for (var _d = 0, methodMap_1 = methodMap; _d < methodMap_1.length; _d++) {
            var _e = methodMap_1[_d], method = _e[0], endpointDef = _e[1];
            if (endpointDef.docs) {
                output += "    ".concat(endpointDef.docs, "\n");
            }
            output += "    ".concat(method, ": {\n");
            output += "      parameters: ".concat(generateParametersType(endpointDef.parameters), ",\n");
            if ((_b = (_a = endpointDef.parameters) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.imports) {
                for (var _f = 0, _g = endpointDef.parameters.body.imports; _f < _g.length; _f++) {
                    var imp = _g[_f];
                    imports.add(imp);
                }
            }
            if (endpointDef.responses) {
                for (var _h = 0, _j = Object.entries(endpointDef.responses); _h < _j.length; _h++) {
                    var _k = _j[_h], status_2 = _k[0], responses = _k[1];
                    if (responses) {
                        for (var _l = 0, responses_1 = responses; _l < responses_1.length; _l++) {
                            var response = responses_1[_l];
                            if (response.imports) {
                                for (var _m = 0, _o = response.imports; _m < _o.length; _m++) {
                                    var imp = _o[_m];
                                    imports.add(imp);
                                }
                            }
                        }
                    }
                }
                output += "      responses: ".concat(endpointDef.responses
                    ? generateResponsesType(endpointDef.responses)
                    : 'never', ";\n");
            }
            if (endpointDef.errors && Object.keys(endpointDef.errors).length > 0) {
                output += "      errors: ".concat(generateErrorsType(endpointDef.errors), ";\n");
            }
            else {
                output += '      errors?: never;\n';
            }
            output += '    };\n';
        }
        output += '  };\n';
    }
    output += '}\n';
    var importsString = Array.from(imports).join('\n');
    return "".concat(importsString, "\n\n").concat(output);
};
var generateParametersType = function (parameters) {
    if (!parameters)
        return 'undefined';
    var output = '{\n';
    if (parameters.body) {
        output += "        body: ".concat(parameters.body.typeString, ";\n");
    }
    if (parameters.path) {
        output += "        path: ".concat(JSON.stringify(parameters.path), ";\n");
    }
    if (parameters.query) {
        output += "        query: ".concat(JSON.stringify(parameters.query), ";\n");
    }
    output += '      }';
    return output;
};
var generateResponsesType = function (responses) {
    if (!responses)
        return 'undefined';
    var responseTypes = [];
    for (var _i = 0, _a = Object.entries(responses); _i < _a.length; _i++) {
        var _b = _a[_i], status_3 = _b[0], responseArray = _b[1];
        var types = responseArray
            .map(function (response) { return response.typeString; })
            .join(' | ');
        responseTypes.push("    ".concat(status_3, ": ").concat(types));
    }
    return "{\n".concat(responseTypes.join(';\n'), "\n  }");
};
var generateErrorsType = function (errors) {
    return JSON.stringify(errors);
};
function formatComplexType(type) {
    var typeText = type.getText();
    // TODO: HANDLE NAMESPACES
    if (typeof type === 'string') {
        if (type.startsWith('import(')) {
            var match = type.match(/import\("(.+)"\)\.(.+)/);
            if (match) {
                var importPath = match[1], importedType = match[2];
                if (importedType) {
                    return {
                        typeString: importedType,
                        imports: new Set([
                            "import type { ".concat(importedType.split('.')[0], " } from \"").concat(importPath, "\";")
                        ])
                    };
                }
            }
        }
        return { typeString: type, imports: new Set() };
    }
    if (Array.isArray(type)) {
        var results = type.map(formatComplexType);
        var imports = new Set(results.flatMap(function (r) { return Array.from(r.imports); }));
        var typeString = "[".concat(results.map(function (r) { return r.typeString; }).join(', '), "]");
        return { typeString: typeString, imports: imports };
    }
    if (typeof type === 'object' && type !== null) {
        var entries = Object.entries(type).map(function (_a) {
            var k = _a[0], v = _a[1];
            var formatted = formatComplexType(v);
            return [k, formatted];
        });
        var imports = new Set(entries.flatMap(function (_a) {
            var v = _a[1];
            return Array.from(v.imports);
        }));
        var typeString = "{\n".concat(entries
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            return "    ".concat(k, ": ").concat(v.typeString, ";");
        })
            .join('\n'), "\n  }");
        return { typeString: typeString, imports: imports };
    }
    return { typeString: String(type), imports: new Set() };
}
function formatObject(obj) {
    if (obj === undefined) {
        return 'undefined';
    }
    if (Array.isArray(obj)) {
        return "[".concat(obj.map(formatObject).join(', '), "]");
    }
    if (typeof obj === 'string') {
        if (/^\{\s*\}$/.test(obj)) {
            return 'never';
        }
        return "".concat(obj);
    }
    if (obj == null || JSON.stringify(obj) === JSON.stringify({})) {
        return 'never';
    }
    var objStr = '{\n';
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var value = formatObject(obj[key]);
            objStr += "          ".concat(key, ": ").concat(value, ",\n");
        }
    }
    objStr += '        }';
    return objStr;
}
function generateActionsOutput() {
    for (var apiPath in actions) {
        actionOutput += "  '".concat(apiPath, "': {\n");
        for (var method in actions[apiPath]) {
            // const docs = actions[apiPath][method]["docs"];
            // if (docs.length > 0) {
            //   console.log("docs", docs);
            //   actionOutput += `   ${docs}`;
            // }
            actionOutput += "    ".concat(method, ": {\n");
            for (var action in actions[apiPath][method]) {
                actionOutput += "      parameters: {\n";
                var parameters = actions[apiPath][method][action]['parameters'];
                for (var paramType in parameters) {
                    var paramValue = formatObject(parameters[paramType]);
                    var optional = paramValue === 'never' ? '?' : '';
                    actionOutput += "        ".concat(paramType).concat(optional, ": ").concat(paramValue, ",\n");
                }
                actionOutput += "      },\n";
                actionOutput += "      responses: {\n";
                for (var statusCode in actions[apiPath][method][action]['responses']) {
                    var response = actions[apiPath][method][action]['responses'][statusCode];
                    var formattedResponse = formatObject(response);
                    if (formattedResponse.trim() === '') {
                        continue;
                    }
                    actionOutput += "        ".concat(statusCode, ": ").concat(formatObject(response), ",\n");
                }
                actionOutput += "      }\n";
                actionOutput += "      errors: {\n";
                for (var statusCode in actions[apiPath][method][action]['errors']) {
                    var response = actions[apiPath][method][action]['errors'][statusCode];
                    actionOutput += "        ".concat(statusCode, ": ").concat(formatObject(response), ",\n");
                }
                actionOutput += "      }\n";
                actionOutput += "    },\n";
            }
        }
        actionOutput += '  },\n';
    }
    actionOutput = 'export interface ActionPaths {\n' + actionOutput + '};\n';
}
function generateInterfaces() {
    var interfaces = fs
        .readFileSync(path.resolve(__dirname, './utils/interfaces.ts'))
        .toString();
    output = interfaces + '\n' + output;
    // add the import statements at the top
    var importsOutput = '';
    for (var _i = 0, _a = Object.entries(importMap); _i < _a.length; _i++) {
        var _b = _a[_i], importName = _b[0], moduleName = _b[1];
        if (moduleName !== './$types' &&
            !['Post', 'Get', 'Put', 'Patch', 'Delete'].includes(importName)) {
            importsOutput += "import { ".concat(importName, " } from \"").concat(moduleName, "\";\n");
        }
    }
    var final_output = importsOutput + output + actionOutput;
    // count how many lines are in the output
    telemetryPayload.data.generated_lines_of_code +=
        final_output.split('\n').length;
    fs.writeFileSync(path.join(outputPath, 'api.ts'), final_output);
    logger_1.log.success(2, "generated Svetch API types in ".concat(path.join(outputPath, 'api.ts')));
}
function generateClient() {
    var interfaces = fs
        .readFileSync(path.resolve(__dirname, './utils/client.ts'))
        .toString();
    output = interfaces + '\n' + output;
    // add the import statements at the top
    var importsOutput = '';
    for (var _i = 0, _a = Object.entries(importMap); _i < _a.length; _i++) {
        var _b = _a[_i], importName = _b[0], moduleName = _b[1];
        if (moduleName !== './$types' &&
            !['Post', 'Get', 'Put', 'Patch', 'Delete'].includes(importName)) {
            importsOutput += "import { ".concat(importName, " } from \"").concat(moduleName, "\";\n");
        }
    }
    var final_output = importsOutput + output;
    telemetryPayload.data.generated_lines_of_code +=
        final_output.split('\n').length;
    fs.writeFileSync(path.join(outputPath, 'client.ts'), final_output);
    logger_1.log.success(2, "Genererated Svetch Client in ".concat(path.join(outputPath, 'client.ts')));
}
var jsonSchema = null;
function sendTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var previousTelemetry, url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (telemetry === false) {
                        return [2 /*return*/];
                    }
                    // read previous telemetry if it exists
                    if (fs.existsSync(path.join(__dirname, 'telemetry.json'))) {
                        previousTelemetry = JSON.parse(fs.readFileSync(path.join(__dirname, 'telemetry.json')).toString());
                        // if the previous telemetry was sent less than 24 hours ago, don't send it again
                        if (Date.now() - previousTelemetry.timestamp < 1000 * 60 * 60 * 24) {
                            return [2 /*return*/];
                        }
                        // if the number of lines of code is the same as the previous telemetry, don't send it again
                        if (previousTelemetry.data.generated_lines_of_code ===
                            telemetryPayload.data.generated_lines_of_code) {
                            return [2 /*return*/];
                        }
                    }
                    // write telemetry locally
                    fs.writeFileSync(path.join(__dirname, 'telemetry.json'), JSON.stringify(telemetryPayload));
                    url = 'https://svetch-dev.vercel.app/telemetry';
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(telemetryPayload)
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        logger_1.log.debug(1, "Telemetry sent successfully, it contains only statistics, if you don't want it, you can set telemetry to false in your .svetchrc file");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function generateSchema() {
    // optionally pass argument to schema generator
    var settings = {
        // required: true,
        ignoreErrors: true
        // topRef: true,
    };
    // optionally pass ts compiler options
    // const compilerOptions: TJS.CompilerOptions = {
    // strictNullChecks: true,
    // };
    // optionally pass a base path
    // const basePath = "./my-dir";
    var program = TJS.getProgramFromFiles([path.resolve("".concat(out, "/api.ts"))]
    // compilerOptions,
    // basePath
    );
    // We can either get the schema for one file and one type...
    var schema = TJS.generateSchema(program, 'APIPaths', settings);
    jsonSchema = schema;
    // ensure schema path is there
    if (!fs.existsSync(schemaOutputPath)) {
        fs.mkdirSync(schemaOutputPath);
    }
    fs.writeFileSync(path.join(outputPath, 'schema.json'), JSON.stringify(schema, null, 2));
    fs.writeFileSync(path.join(schemaOutputPath, 'apiSchema.json'), JSON.stringify(schema));
    telemetryPayload.data.generated_lines_of_code +=
        JSON.stringify(schema).split('\n').length;
}
function generateZodSchema() {
    return __awaiter(this, void 0, void 0, function () {
        var schema, output;
        return __generator(this, function (_a) {
            schema = (0, json_schema_to_zod_1.parseSchema)(jsonSchema);
            output = "import { z } from 'zod';\n\nexport const schema = ".concat(schema, ";");
            telemetryPayload.data.generated_lines_of_code += output.split('\n').length;
            //   write
            fs.writeFileSync(path.join(outputPath, 'zod.ts'), output);
            logger_1.log.success(2, "Generated zod schema in ".concat(path.join(outputPath, 'zod.ts')));
            return [2 /*return*/];
        });
    });
}
function generateSvetchClient() {
    var client = fs
        .readFileSync(path.resolve(__dirname, './utils/client.ts'))
        .toString();
    // if the schema was generated, add it to the client
    if (fs.existsSync(path.join(outputPath, 'zod.ts'))) {
        client = "import { schema } from './zod'" + '\n' + client;
    }
    if (fs.existsSync(path.join(outputPath, 'schema.json'))) {
        client = "import type { APIPaths } from './api'" + '\n' + client;
    }
    // write
    fs.writeFileSync(path.join(outputPath, 'client.ts'), client);
    logger_1.log.success(2, "Generated client in ".concat(path.join(outputPath, 'client.ts')));
}
function generateSvetchDocs() {
    var docs = fs
        .readFileSync(path.resolve(__dirname, './static/docs/+page.svelte'))
        .toString()
        .replace('[CLIENT_PATH]', path.join(workingDir, out, 'client').replace(workingDir, '').slice(1));
    // get all components inside the static/docs/components folder
    var body_block = fs
        .readFileSync(path.resolve(__dirname, './static/docs/components/BodyBlock.svelte'))
        .toString()
        .replace('[INTERFACE_PATH]', path.join(workingDir, out, 'api').replace(workingDir, '').slice(1));
    var Collapsible = fs
        .readFileSync(path.resolve(__dirname, './static/docs/components/Collapsible.svelte'))
        .toString();
    // get all components inside the static/docs/components folder
    // create the folders
    if (!fs.existsSync(docsOutputPath)) {
        fs.mkdirSync(docsOutputPath, { recursive: true });
    }
    if (!fs.existsSync(path.join(docsOutputPath, 'components'))) {
        fs.mkdirSync(path.join(docsOutputPath, 'components'), { recursive: true });
    }
    // write
    fs.writeFileSync(path.join(docsOutputPath, '+page.svelte'), docs);
    fs.writeFileSync(path.join(docsOutputPath, 'components/BodyBlock.svelte'), body_block);
    fs.writeFileSync(path.join(docsOutputPath, 'components/Collapsible.svelte'), Collapsible);
    logger_1.log.success(2, "Generated docs in ".concat(docsOutputPath));
}
function main(args) {
    tsconfig = args.tsconfig;
    framework = args.framework;
    input = args.input;
    out = args.out;
    logLevel = args.logLevel;
    filter = args.filter;
    docs = args.docs;
    staticFolder = args.staticFolder;
    telemetry = args.telemetry;
    project.addSourceFilesAtPaths(["".concat(input, "/**/*+server.ts")]);
    // Change output path here:
    outputPath = path.join(workingDir, out);
    schemaOutputPath = path.join(workingDir, staticFolder);
    docsOutputPath = path.join(workingDir, docs);
    // check if input folder exists
    if (!fs.existsSync(input)) {
        logger_1.log.error(1, "Input folder ".concat(input, " does not exist"));
        logger_1.log.warn(1, "Please change it in your .svetchrc file here: \uD83D\uDC49 [".concat(path.resolve(workingDir, '.svetchrc'), "]\nOr run svetch init again.\n\nExiting...\n\n"));
        process.exit(1);
    }
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    logger_1.log.info(1, "Generating API types in ".concat(outputPath));
    processFiles();
    logger_1.log.header(1, "Processed, Writing files...");
    output += generateApiTypes(endpoints);
    generateActionsOutput();
    generateInterfaces();
    generateClient();
    try {
        generateSchema();
        generateZodSchema();
        generateSvetchDocs();
    }
    catch (error) {
        logger_1.log.error(1, "Error generating schema, please report this to the developer, ".concat(error));
    }
    generateSvetchClient();
    try {
        sendTelemetry();
    }
    catch (error) { }
    logger_1.log.success(1, "\n".concat(separator, "\nDone!, now import Svetch using the following code:\n\n"));
    logger_1.log.info(1, "import { Svetch } from ".concat(path
        .join(workingDir, out, 'client')
        .replace(workingDir, '')
        .slice(1), ";"));
    logger_1.log.info(1, "const svetch = new Svetch();\n\n");
    // find how many files are in the project, that end in +server.ts
    var totalFiles = project.getSourceFiles().filter(function (file) {
        return file.getFilePath().includes('+server.ts');
    }).length;
    // if files more than 10, prompt user to purchase
    if (totalFiles > 10) {
        logger_1.log.info(1, "\n      \u001B[33m\u26A0 Wow! You have ".concat(totalFiles, " endpoints in your project. You're certainly getting the most out of Svetch!\n\n      By now, you must have realized the value Svetch brings to your development process - the time it saves, the consistency it provides, and the boilerplate it cuts out. It's become a crucial part of your toolkit.\n\n      \u001B[37mSvetch is a labor of love, maintained and continually improved to help developers like you create amazing things with less effort. But we need your support to keep it growing and evolving.\n      By purchasing a license, you contribute to the future development and maintenance of Svetch.\n\n      Plus, with a full license, you can use Svetch with no restrictions, no matter how big your projects get! \n    "));
        logger_1.log.header(1, "\n      \uD83D\uDC49 Support the development and get your license here: [https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d]\n      \n      Thank you for using Svetch and for your support!\n      ");
        // the library will still work
    }
}
// runAll()
