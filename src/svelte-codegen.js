"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.footprintOfType = footprintOfType;
var ts_morph_1 = require("ts-morph");
var PRIMITIVE_TYPES = new Set([
    'string',
    'number',
    'boolean',
    'undefined',
    'null',
    'unknown',
    'any',
    'void',
    'date',
    'Date',
    'bigint'
]);
var processedTypes = new WeakMap();
var MAX_DEPTH = 3; // Adjust this value as needed
function footprintOfType(_a) {
    var _b;
    var file = _a.file, type = _a.type, node = _a.node, _c = _a.overrides, overrides = _c === void 0 ? {} : _c, _d = _a.flags, flags = _d === void 0 ? [] : _d, _e = _a.depth, depth = _e === void 0 ? 0 : _e;
    // Check if we've already processed this type
    if (processedTypes.has(type)) {
        return processedTypes.get(type);
    }
    if (depth > MAX_DEPTH) {
        // If we've exceeded the maximum depth, try to import the type instead
        var importInfo = getTypeImport(type, file);
        if (importInfo) {
            console.log(importInfo);
            return importInfo;
        }
        // If we can't import, fall back to 'any'
        console.warn("Max depth exceeded for type: ".concat(type.getText(), ". Using 'any' instead."));
        return { typeString: 'any', imports: new Set() };
    }
    var symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
    if (symbol && overrides[symbol.getName()]) {
        return { typeString: overrides[symbol.getName()], imports: new Set() };
    }
    var next = function (nextType, nextFlags) {
        if (nextFlags === void 0) { nextFlags = []; }
        return footprintOfType({
            file: file,
            type: nextType,
            node: node,
            overrides: overrides,
            flags: __spreadArray(__spreadArray([], flags, true), nextFlags, true),
            depth: depth + 1
        });
    };
    var result = { typeString: '', imports: new Set() };
    if (isPrimitive(type)) {
        var typeString = void 0;
        if (type.isLiteral()) {
            var literalValue = type.getLiteralValue();
            if (type.isStringLiteral()) {
                typeString =
                    literalValue !== undefined ? "'".concat(literalValue, "'") : type.getText();
            }
            else if (type.isBooleanLiteral() || type.isNumberLiteral()) {
                typeString =
                    literalValue !== undefined ? literalValue.toString() : type.getText();
            }
            else {
                typeString = type.getText();
            }
        }
        else {
            typeString = type.getText();
        }
        return { typeString: typeString, imports: new Set() };
    }
    if (type.isArray()) {
        var elementType = type.getArrayElementTypeOrThrow();
        var elementResult = next(elementType);
        result.imports = elementResult.imports;
        result.typeString = isPrimitive(elementType)
            ? "".concat(elementResult.typeString, "[]")
            : "Array<\n".concat(indent(elementResult.typeString), "\n>");
    }
    else if (type.isObject() && ((_b = type.getSymbol()) === null || _b === void 0 ? void 0 : _b.getName()) === 'Date') {
        result.typeString = 'Date';
    }
    if (type.isTuple()) {
        var tupleResults = type
            .getTupleElements()
            .map(function (elementType) { return next(elementType, flags); });
        var imports = new Set(tupleResults.flatMap(function (r) { return Array.from(r.imports); }));
        var typeString = "[\n".concat(indent(tupleResults.map(function (r) { return r.typeString; }).join(',\n')), "\n]");
        return { typeString: typeString, imports: imports };
    }
    if (isPromise(type)) {
        var promiseType = type.getTypeArguments()[0];
        var promiseResult = next(promiseType);
        result.imports = promiseResult.imports;
        result.typeString = isPrimitive(promiseType)
            ? "Promise<".concat(promiseResult.typeString, ">")
            : "Promise<\n".concat(indent(promiseResult.typeString), "\n>");
    }
    else if (isSimpleSignature(type)) {
        result = formatSignatures(type.getCallSignatures(), 'type', next);
    }
    else if (type.isObject()) {
        result = formatObject(type, node, next);
    }
    else if (type.isUnion()) {
        result = formatUnion(type, flags, next);
    }
    else if (type.isIntersection()) {
        result = formatIntersection(type, node, flags, next);
    }
    else {
        var importInfo = getTypeImport(type, file);
        if (importInfo) {
            result.typeString = importInfo.typeString;
            if (importInfo.imports) {
                for (var _i = 0, _f = importInfo.imports; _i < _f.length; _i++) {
                    var importStatement = _f[_i];
                    result.imports.add(importStatement);
                }
            }
        }
        else {
            console.warn('Unhandled type:', type.getText());
            result.typeString = 'any'; // or 'unknown', depending on your preference
        }
    }
    // Cache the result before returning
    processedTypes.set(type, result);
    return result;
}
function getTypeImport(type, sourceFile) {
    var typeAliases = sourceFile.getTypeAliases();
    var imports = new Set();
    // Helper function to check if types are equivalent
    function areTypesEquivalent(type1, type2) {
        return type1.getText() === type2.getText();
    }
    // Helper function to get formatted type from alias
    function getFormattedTypeFromAlias(alias) {
        var aliasType = alias.getType();
        if (areTypesEquivalent(type, aliasType)) {
            var aliasName = alias.getName();
            var importDeclaration = alias.getImportDeclaration();
            if (importDeclaration) {
                var moduleSpecifier = importDeclaration.getModuleSpecifierValue();
                imports.add("import { ".concat(aliasName, " } from '").concat(moduleSpecifier, "';"));
            }
            return {
                typeString: aliasName,
                imports: imports
            };
        }
        return null;
    }
    // Try to find a matching type alias
    for (var _i = 0, typeAliases_1 = typeAliases; _i < typeAliases_1.length; _i++) {
        var alias = typeAliases_1[_i];
        var formattedType = getFormattedTypeFromAlias(alias);
        if (formattedType) {
            return formattedType;
        }
    }
    // If no matching alias is found, fall back to the full type text
    return {
        typeString: type.getText(),
        imports: imports
    };
}
function isDateType(type) {
    var _a;
    return type.isObject() && ((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.getName()) === 'Date';
}
function isPrimitive(type) {
    if (PRIMITIVE_TYPES.has(type.getText()))
        return true;
    return !!(type.isLiteral() ||
        type.isUndefined() ||
        type.isNull() ||
        type.isUnknown() ||
        type.isAny() ||
        type.isVoid() ||
        type.isNever() ||
        type.getFlags() & ts_morph_1.TypeFlags.BigIntLiteral ||
        isDateType(type));
}
function isPromise(type) {
    var symbol = type.getSymbol();
    return (type.isObject() &&
        (symbol === null || symbol === void 0 ? void 0 : symbol.getName()) === 'Promise' &&
        type.getTypeArguments().length === 1);
}
function isSimpleSignature(type) {
    if (!type.isObject())
        return false;
    var sigs = type.getCallSignatures();
    return (sigs.length === 1 &&
        type.getProperties().length === 0 &&
        type.getTypeArguments().length === 0 &&
        !type.getNumberIndexType() &&
        !type.getStringIndexType());
}
function indent(text, level) {
    if (level === void 0) { level = 1; }
    return text.replace(/^/gm, ' '.repeat(level * 2));
}
function formatSignatures(sigs, variant, next) {
    var results = sigs.map(function (sig) { return formatSignature(sig, variant, next); });
    var imports = new Set(results.flatMap(function (r) { return Array.from(r.imports); }));
    var typeString = results.map(function (r) { return r.typeString; }).join('\n');
    return { typeString: typeString, imports: imports };
}
function formatObject(type, node, next) {
    var typeArguments = type.getTypeArguments();
    if (typeArguments.length > 0) {
        return formatGenericObject(type, typeArguments, next);
    }
    var properties = type.getProperties();
    var propertyResults = properties.map(function (prop) {
        var propType = prop.getTypeAtLocation(node);
        var propResult = next(propType, []);
        return __assign({ name: prop.getName(), optional: prop.hasFlags(ts_morph_1.SymbolFlags.Optional) }, propResult);
    });
    var imports = new Set(propertyResults.flatMap(function (p) { return Array.from(p.imports); }));
    var typeString = "{".concat(propertyResults
        .map(function (p) { return "  ".concat(p.name).concat(p.optional ? '?' : '', ": ").concat(p.typeString, ";"); })
        .join('\n'), "}");
    return { typeString: typeString, imports: imports };
}
function formatGenericObject(type, typeArguments, next) {
    var _a;
    var baseTypeName = ((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.getName()) || 'unknown';
    var typeArgResults = typeArguments.map(function (arg) { return next(arg, []); });
    var imports = new Set(typeArgResults.flatMap(function (r) { return Array.from(r.imports); }));
    var typeString = "".concat(baseTypeName, "<").concat(typeArgResults
        .map(function (r) { return r.typeString; })
        .join(', '), ">");
    return { typeString: typeString, imports: imports };
}
function formatUnion(type, flags, next) {
    var results = type
        .getUnionTypes()
        .filter(function (t) {
        return !flags.includes('remove-undefined-from-intersections') ||
            !t.isUndefined();
    })
        .map(function (t) { return next(t, flags); });
    var imports = new Set(results.flatMap(function (r) { return Array.from(r.imports); }));
    var typeString = results.map(function (r) { return r.typeString; }).join(' | ');
    return { typeString: typeString, imports: imports };
}
function formatIntersection(type, node, flags, next) {
    var intersectionTypes = type.getIntersectionTypes();
    var results = intersectionTypes.map(function (t) { return next(t, flags); });
    var imports = new Set(results.flatMap(function (r) { return Array.from(r.imports); }));
    // Separate object types and non-object types
    var objectTypes = [];
    var nonObjectTypes = [];
    results.forEach(function (r) {
        if (r.typeString.trim().startsWith('{')) {
            // This is an object type, extract its properties
            objectTypes.push(r.typeString.slice(1, -1).trim());
        }
        else {
            // This is not an object type, keep it as is
            nonObjectTypes.push(r.typeString);
        }
    });
    // Combine object types
    var combinedObjectType = objectTypes.length > 0 ? "{\n".concat(objectTypes.join('\n'), "\n}") : '';
    // Combine all types
    var allTypes = __spreadArray([], nonObjectTypes, true);
    if (combinedObjectType) {
        allTypes.push(combinedObjectType);
    }
    var typeString = allTypes.length > 1
        ? "(\n".concat(indent(allTypes.join(' &\n')), "\n)")
        : allTypes[0];
    return { typeString: typeString, imports: imports };
}
function formatProperty(prop, node, next) {
    var type = prop.getTypeAtLocation(node);
    var sigs = type.getCallSignatures();
    var firstSig = sigs[0];
    if (isSimpleSignature(type) &&
        !prop.hasFlags(ts_morph_1.SymbolFlags.Optional) &&
        firstSig) {
        var result_1 = formatSignature(firstSig, 'declaration', next, prop.getName());
        return __assign(__assign({}, result_1), { typeString: result_1.typeString + ';' });
    }
    var isOptional = prop.hasFlags(ts_morph_1.SymbolFlags.Optional);
    var result = next(type, [isOptional ? 'remove-undefined-from-intersections' : false].filter(function (flag) { return flag !== false; }));
    return __assign(__assign({}, result), { typeString: "".concat(prop.getName()).concat(isOptional ? '?' : '', ": ").concat(result.typeString, ";") });
}
function formatProperties(props, node, next) {
    var results = props
        .filter(function (prop) {
        var _a;
        if ((_a = prop.getValueDeclaration()) === null || _a === void 0 ? void 0 : _a.getType().getCallSignatures().length)
            return false;
        var declaration = prop.getValueDeclaration();
        if (ts_morph_1.Node.isIndexSignatureDeclaration(declaration))
            return false;
        if (prop.getDeclarations().some(ts_morph_1.Node.isMethodDeclaration))
            return false;
        var name = prop.getName();
        if (name.startsWith('__@'))
            return false;
        return true;
    })
        .map(function (prop) { return formatProperty(prop, node, next); });
    var imports = new Set(results.flatMap(function (r) { return Array.from(r.imports); }));
    var typeString = results.map(function (r) { return r.typeString; }).join('\n');
    return { typeString: typeString, imports: imports };
}
function formatSignature(sig, variant, next, methodName, flags) {
    var _a;
    if (flags === void 0) { flags = []; }
    var name = (_a = sig.getDeclaration().getSymbol()) === null || _a === void 0 ? void 0 : _a.getName();
    var nameToUse = methodName !== null && methodName !== void 0 ? methodName : (['__type', '__call'].includes(name !== null && name !== void 0 ? name : '') ? '' : name);
    var paramResults = sig.getParameters().map(function (param) {
        var paramType = param
            .getDeclarations()
            .map(function (decl) { return next(decl.getType(), flags); })
            .reduce(function (acc, curr) { return ({
            typeString: acc.typeString + curr.typeString,
            imports: new Set(__spreadArray(__spreadArray([], acc.imports, true), curr.imports, true))
        }); }, { typeString: '', imports: new Set() });
        return __assign({ name: param.getName(), optional: param.hasFlags(ts_morph_1.SymbolFlags.Optional) }, paramType);
    });
    var returnTypeResult = next(sig.getReturnType(), flags);
    var imports = new Set(__spreadArray(__spreadArray([], paramResults.flatMap(function (p) { return Array.from(p.imports); }), true), Array.from(returnTypeResult.imports), true));
    var paramsString = paramResults
        .map(function (p) { return "".concat(p.name).concat(p.optional ? '?' : '', ": ").concat(p.typeString); })
        .join(', ');
    var typeString = "".concat(variant === 'declaration' ? nameToUse : '', "(").concat(paramsString, ")").concat(variant === 'declaration' ? ': ' : ' => ').concat(returnTypeResult.typeString);
    return { typeString: typeString, imports: imports };
}
