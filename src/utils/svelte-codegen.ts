import {
  type Type,
  Node,
  TypeFormatFlags,
  type SourceFile,
  type Symbol,
  SymbolFlags,
  type Signature,
  TypeFlags,
  TypeAliasDeclaration,
} from "ts-morph";
import type { FormattedType } from "../types/core.js";

const PRIMITIVE_TYPES = new Set([
  "string",
  "number",
  "boolean",
  "undefined",
  "null",
  "unknown",
  "any",
  "void",
  "date",
  "Date",
  "bigint",
]);

type FormatFlags = "remove-undefined-from-intersections" | false;

interface FootprintParams {
  file: SourceFile;
  type: Type;
  node: Node;
  overrides?: Record<string, string>;
  flags?: FormatFlags[];
  depth?: number;
}

const processedTypes = new WeakMap<Type, FormattedType>();

const MAX_DEPTH = 3; // Adjust this value as needed

export function footprintOfType({
  file,
  type,
  node,
  overrides = {},
  flags = [],
  depth = 0,
}: FootprintParams): FormattedType {
  // Check if we've already processed this type
  if (processedTypes.has(type)) {
    return processedTypes.get(type)!;
  }

  if (depth > MAX_DEPTH) {
    throw new Error(`Max depth exceeded for type: ${type.getText()}`);
    // If we've exceeded the maximum depth, try to import the type instead
    const importInfo = getTypeImport(type, file);

    if (importInfo) {
      console.log(importInfo);
      return importInfo;
    }
    // If we can't import, fall back to 'any'
    console.warn(
      `Max depth exceeded for type: ${type.getText()}. Using 'any' instead.`
    );
    return { typeString: "any", imports: new Set() };
  }

  const symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
  if (symbol && overrides[symbol.getName()]) {
    return { typeString: overrides[symbol.getName()], imports: new Set() };
  }

  const next = (nextType: Type, nextFlags: FormatFlags[] = []): FormattedType =>
    footprintOfType({
      file,
      type: nextType,
      node,
      overrides,
      flags: [...flags, ...nextFlags],
      depth: depth + 1,
    });

  let result: FormattedType = { typeString: "", imports: new Set() };

  if (isPrimitive(type)) {
    let typeString: string;
    if (type.isLiteral()) {
      const literalValue = type.getLiteralValue();
      if (type.isStringLiteral()) {
        typeString =
          literalValue !== undefined ? `'${literalValue}'` : type.getText();
      } else if (type.isBooleanLiteral() || type.isNumberLiteral()) {
        typeString =
          literalValue !== undefined ? literalValue.toString() : type.getText();
      } else {
        typeString = type.getText();
      }
    } else {
      typeString = type.getText();
    }
    return { typeString, imports: new Set() };
  }
  if (type.isArray()) {
    const elementType = type.getArrayElementTypeOrThrow();
    const elementResult = next(elementType);
    result.imports = elementResult.imports;
    result.typeString = isPrimitive(elementType)
      ? `${elementResult.typeString}[]`
      : `Array<\n${indent(elementResult.typeString)}\n>`;
  } else if (type.isObject() && type.getSymbol()?.getName() === "Date") {
    result.typeString = "Date";
  }
  if (type.isTuple()) {
    const tupleResults = type
      .getTupleElements()
      .map((elementType) => next(elementType, flags));
    const imports = new Set(tupleResults.flatMap((r) => Array.from(r.imports)));
    const typeString = `[\n${indent(
      tupleResults.map((r) => r.typeString).join(",\n")
    )}\n]`;
    return { typeString, imports };
  }
  if (isPromise(type)) {
    const promiseType = type.getTypeArguments()[0];
    const promiseResult = next(promiseType);
    result.imports = promiseResult.imports;
    result.typeString = isPrimitive(promiseType)
      ? `Promise<${promiseResult.typeString}>`
      : `Promise<\n${indent(promiseResult.typeString)}\n>`;
  } else if (isSimpleSignature(type)) {
    result = formatSignatures(type.getCallSignatures(), "type", next);
  } else if (type.isObject()) {
    try {
      result = formatObject(type, node, next);
    } catch (e) {
      console.error(e);
      result = getTypeImport(type, file);
    }
  } else if (type.isUnion()) {
    result = formatUnion(type, flags, next);
  } else if (type.isIntersection()) {
    result = formatIntersection(type, node, flags, next);
  } else {
    const importInfo = getTypeImport(type, file);

    if (importInfo) {
      result.typeString = importInfo.typeString;
      if (importInfo.imports) {
        for (const importStatement of importInfo.imports) {
          result.imports.add(importStatement);
        }
      }
    } else {
      console.warn("Unhandled type:", type.getText());
      result.typeString = "any"; // or 'unknown', depending on your preference
    }
  }

  // Cache the result before returning
  processedTypes.set(type, result);
  return result;
}

function getTypeImport(type: Type, sourceFile: SourceFile): FormattedType {
  const typeAliases = sourceFile.getTypeAliases();
  const imports = new Set<string>();

  // Helper function to check if types are equivalent
  function areTypesEquivalent(type1: Type, type2: Type): boolean {
    return type1.getText() === type2.getText();
  }

  // Helper function to get formatted type from alias
  function getFormattedTypeFromAlias(
    alias: TypeAliasDeclaration
  ): FormattedType | null {
    const aliasType = alias.getType();
    if (areTypesEquivalent(type, aliasType)) {
      const aliasName = alias.getName();
      const importDeclaration = alias.getImportDeclaration();

      if (importDeclaration) {
        const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
        imports.add(`import { ${aliasName} } from '${moduleSpecifier}';`);
      }

      return {
        typeString: aliasName,
        imports,
      };
    }
    return null;
  }

  // Try to find a matching type alias
  for (const alias of typeAliases) {
    const formattedType = getFormattedTypeFromAlias(alias);
    if (formattedType) {
      return formattedType;
    }
  }

  // If no matching alias is found, fall back to the full type text
  return {
    typeString: type.getText(),
    imports,
  };
}

function isDateType(type: Type): boolean {
  return type.isObject() && type.getSymbol()?.getName() === "Date";
}

function isPrimitive(type: Type): boolean {
  if (PRIMITIVE_TYPES.has(type.getText())) return true;
  return !!(
    type.isLiteral() ||
    type.isUndefined() ||
    type.isNull() ||
    type.isUnknown() ||
    type.isAny() ||
    type.isVoid() ||
    type.isNever() ||
    type.getFlags() & TypeFlags.BigIntLiteral ||
    isDateType(type)
  );
}

function isPromise(type: Type): boolean {
  const symbol = type.getSymbol();
  return (
    type.isObject() &&
    symbol?.getName() === "Promise" &&
    type.getTypeArguments().length === 1
  );
}

function isSimpleSignature(type: Type): boolean {
  if (!type.isObject()) return false;
  const sigs = type.getCallSignatures();
  return (
    sigs.length === 1 &&
    type.getProperties().length === 0 &&
    type.getTypeArguments().length === 0 &&
    !type.getNumberIndexType() &&
    !type.getStringIndexType()
  );
}

function indent(text: string, level: number = 1): string {
  return text.replace(/^/gm, " ".repeat(level * 2));
}

function formatSignatures(
  sigs: Signature[],
  variant: "type" | "declaration",
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const results = sigs.map((sig) => formatSignature(sig, variant, next));
  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeString = results.map((r) => r.typeString).join("\n");
  return { typeString, imports };
}

function formatObject(
  type: Type,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const typeArguments = type.getTypeArguments();
  if (typeArguments.length > 0) {
    return formatGenericObject(type, typeArguments, next);
  }

  const properties = type.getProperties();
  const propertyResults = properties.map((prop) => {
    const propType = prop.getTypeAtLocation(node);
    const propResult = next(propType, []);
    return {
      name: prop.getName(),
      optional: prop.hasFlags(SymbolFlags.Optional),
      ...propResult,
    };
  });

  const imports = new Set(
    propertyResults.flatMap((p) => Array.from(p.imports))
  );
  const typeString = `{${propertyResults
    .map((p) => `  ${p.name}${p.optional ? "?" : ""}: ${p.typeString};`)
    .join("\n")}}`;

  return { typeString, imports };
}

function formatGenericObject(
  type: Type,
  typeArguments: Type[],
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const baseTypeName = type.getSymbol()?.getName() || "unknown";
  const typeArgResults = typeArguments.map((arg) => next(arg, []));
  const imports = new Set(typeArgResults.flatMap((r) => Array.from(r.imports)));
  const typeString = `${baseTypeName}<${typeArgResults
    .map((r) => r.typeString)
    .join(", ")}>`;
  return { typeString, imports };
}

function formatUnion(
  type: Type,
  flags: FormatFlags[],
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const results = type
    .getUnionTypes()
    .filter(
      (t) =>
        !flags.includes("remove-undefined-from-intersections") ||
        !t.isUndefined()
    )
    .map((t) => next(t, flags));

  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeString = results.map((r) => r.typeString).join(" | ");
  return { typeString, imports };
}

function formatIntersection(
  type: Type,
  node: Node,
  flags: FormatFlags[],
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const intersectionTypes = type.getIntersectionTypes();
  const results = intersectionTypes.map((t) => next(t, flags));

  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));

  // Separate object types and non-object types
  const objectTypes: string[] = [];
  const nonObjectTypes: string[] = [];

  results.forEach((r) => {
    if (r.typeString.trim().startsWith("{")) {
      // This is an object type, extract its properties
      objectTypes.push(r.typeString.slice(1, -1).trim());
    } else {
      // This is not an object type, keep it as is
      nonObjectTypes.push(r.typeString);
    }
  });

  // Combine object types
  const combinedObjectType =
    objectTypes.length > 0 ? `{\n${objectTypes.join("\n")}\n}` : "";

  // Combine all types
  const allTypes = [...nonObjectTypes];
  if (combinedObjectType) {
    allTypes.push(combinedObjectType);
  }

  const typeString =
    allTypes.length > 1
      ? `(\n${indent(allTypes.join(" &\n"))}\n)`
      : allTypes[0];

  return { typeString, imports };
}

function formatProperty(
  prop: Symbol,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const type = prop.getTypeAtLocation(node);
  const sigs = type.getCallSignatures();
  const firstSig = sigs[0];

  if (
    isSimpleSignature(type) &&
    !prop.hasFlags(SymbolFlags.Optional) &&
    firstSig
  ) {
    const result = formatSignature(
      firstSig,
      "declaration",
      next,
      prop.getName()
    );
    return { ...result, typeString: result.typeString + ";" };
  }

  const isOptional = prop.hasFlags(SymbolFlags.Optional);
  const result = next(
    type,
    [isOptional ? "remove-undefined-from-intersections" : false].filter(
      (flag): flag is FormatFlags => flag !== false
    )
  );

  return {
    ...result,
    typeString: `${prop.getName()}${isOptional ? "?" : ""}: ${
      result.typeString
    };`,
  };
}

function formatProperties(
  props: Symbol[],
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => FormattedType
): FormattedType {
  const results = props
    .filter((prop) => {
      if (prop.getValueDeclaration()?.getType().getCallSignatures().length)
        return false;
      const declaration = prop.getValueDeclaration();
      if (Node.isIndexSignatureDeclaration(declaration)) return false;
      if (prop.getDeclarations().some(Node.isMethodDeclaration)) return false;
      const name = prop.getName();
      if (name.startsWith("__@")) return false;
      return true;
    })
    .map((prop) => formatProperty(prop, node, next));

  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeString = results.map((r) => r.typeString).join("\n");
  return { typeString, imports };
}

function formatSignature(
  sig: Signature,
  variant: "type" | "declaration",
  next: (type: Type, flags: FormatFlags[]) => FormattedType,
  methodName?: string,
  flags: FormatFlags[] = []
): FormattedType {
  const name = sig.getDeclaration().getSymbol()?.getName();
  const nameToUse =
    methodName ?? (["__type", "__call"].includes(name ?? "") ? "" : name);

  const paramResults = sig.getParameters().map((param) => {
    const paramType = param
      .getDeclarations()
      .map((decl) => next(decl.getType(), flags))
      .reduce(
        (acc, curr) => ({
          typeString: acc.typeString + curr.typeString,
          imports: new Set([...acc.imports, ...curr.imports]),
        }),
        { typeString: "", imports: new Set<string>() }
      );

    return {
      name: param.getName(),
      optional: param.hasFlags(SymbolFlags.Optional),
      ...paramType,
    };
  });

  const returnTypeResult = next(sig.getReturnType(), flags);

  const imports = new Set([
    ...paramResults.flatMap((p) => Array.from(p.imports)),
    ...Array.from(returnTypeResult.imports),
  ]);

  const paramsString = paramResults
    .map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.typeString}`)
    .join(", ");

  const typeString = `${
    variant === "declaration" ? nameToUse : ""
  }(${paramsString})${variant === "declaration" ? ": " : " => "}${
    returnTypeResult.typeString
  }`;

  return { typeString, imports };
}
