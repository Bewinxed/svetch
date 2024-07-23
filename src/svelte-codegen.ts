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
import type { FormattedType } from "./types/core.js";
import { Traverse } from "neotraverse/modern";

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

function handlePrimitiveType(type: Type): FormattedType {
  let typeString: string;

  switch (true) {
    case isDateType(type):
      typeString = "Date";
      break;

    case type.isLiteral():
      {
        const literalValue = type.getLiteralValue();
        switch (true) {
          case type.isStringLiteral():
            typeString =
              literalValue !== undefined ? `'${literalValue}'` : type.getText();
            break;
          case type.isBooleanLiteral():
          case type.isNumberLiteral():
            typeString =
              literalValue !== undefined
                ? literalValue.toString()
                : type.getText();
            break;
          default:
            typeString = type.getText();
        }
      }
      break;

    default:
      typeString = type.getText();
  }

  return { typeString, imports: new Set() };
}

function handleArrayType(type: Type, next: (type: Type) => FormattedType) {
  const elementType = type.getArrayElementTypeOrThrow();
  const elementResult = next(elementType);
  const imports = elementResult.imports;
  const typeString = isPrimitive(elementType)
    ? `${elementResult.typeString}[]`
    : `Array<\n${indent(elementResult?.typeString)}\n>`;
  return { typeString, imports };
}

function handleTupleType(
  type: Type,
  next: (type: Type, flags: FormatFlags[]) => FormattedType,
  flags: FormatFlags[]
) {
  const tupleResults = type
    .getTupleElements()
    .map((elementType) => next(elementType, flags));
  const imports = new Set(
    tupleResults.flatMap((r) => (r.imports ? Array.from(r.imports) : []))
  );
  const typeString = `[\n${indent(
    tupleResults.map((r) => r.typeString).join(",\n")
  )}\n]`;
  return { typeString, imports };
}

function handlePromiseType(
  type: Type,
  next: (type: Type, flags: FormatFlags[]) => FormattedType,
  flags: FormatFlags[]
) {
  const promiseType = type.getTypeArguments()[0];
  const promiseResult = next(promiseType, flags);
  const imports = promiseResult.imports;
  const typeString = isPrimitive(promiseType)
    ? `Promise<${promiseResult.typeString}>`
    : `Promise<\n${indent(promiseResult.typeString)}\n>`;

  return { typeString, imports };
}

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

  // if object, check depth first:
  // if depth > MAX_DEPTH, try to import the type instead

  let result: FormattedType = { typeString: "", imports: new Set() };

  // if (type.isObject()) {
  //   new Traverse(type, {}).forEach((ctx, x) => {
  //     if (ctx.level > MAX_DEPTH) {
  //       result = getTypeImport(type, file);
  //       ctx.stop();
  //     }
  //   });
  // }

  if (depth > MAX_DEPTH) {
    throw new Error(`Max depth exceeded for type: ${type.getText()}`);
  }

  //   // console.log("max depth", type.getText());
  //   // If we've exceeded the maximum depth, try to import the type instead
  //   const importInfo = getTypeImport(type, file);

  //   if (importInfo) {
  //     // console.log(importInfo);
  //     return importInfo;
  //   }
  //   // If we can't import, fall back to 'any'
  //   console.warn(
  //     `Max depth exceeded for type: ${type.getText()}. Using 'any' instead.`
  //   );
  //   return { typeString: "any", imports: new Set() };
  // }

  const symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
  if (symbol && overrides[symbol.getName()]) {
    console.log("symbol override", symbol.getName());
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

  // log the type of type

  if (isPrimitive(type)) {
    // console.log("primitive", type.getText());
    result = handlePrimitiveType(type);
  } else if (type.isArray()) {
    result = handleArrayType(type, next);
  } else if (type.isTuple()) {
    result = handleTupleType(type, next, flags);
  } else if (isPromise(type)) {
    result = handlePromiseType(type, next, flags);
  } else if (isSimpleSignature(type)) {
    // console.log("signature", type.getText());
    result = formatSignatures(type.getCallSignatures(), "type", next);
  } else if (type.isObject()) {
    try {
      result = formatObject(type, node, next);
    } catch (e) {
      // console.error((e as Error).message);
      result = getTypeImport(type, file);
    }
  } else if (type.isUnion()) {
    result = formatUnion(type, flags, next);
  } else if (type.isIntersection()) {
    try {
      result = formatIntersection(type, node, flags, next);
    } catch (e) {
      // console.error((e as Error).message);
      result = getTypeImport(type, file);
    }
  } else {
    console.log("type import", type.getText());
    const importInfo = getTypeImport(type, file);

    if (importInfo) {
      result = importInfo;
    } else {
      console.warn("Unhandled type:", type.getText());
      result.typeString = "any"; // or 'unknown', depending on your preference
    }
  }

  // Cache the result before returning
  processedTypes.set(type, result);

  return result;
}

export interface FormattedType {
  typeString?: string;
  imports?: Set<string>;
}

function formatImportAndType(text: string): FormattedType {
  const result: FormattedType = {
    imports: new Set<string>(),
  };

  // Regular expression pattern for imports
  const importPattern = /import\(([^)]+)\)\s*\.\s*(\*|\w+)(?:\s*\.\s*(\w+))?/g;

  let match;
  let typeString = text;
  const importPaths = new Map<string, Set<string>>();

  while ((match = importPattern.exec(text)) !== null) {
    const [fullMatch, importPath, namespace, specificType] = match;
    const cleanImportPath = importPath.replace(/["']/g, "");

    if (!importPaths.has(cleanImportPath)) {
      importPaths.set(cleanImportPath, new Set<string>());
    }

    if (namespace === "*") {
      importPaths.get(cleanImportPath)!.add("*");
    } else {
      importPaths.get(cleanImportPath)!.add(namespace);
    }

    // Only replace the import part, preserving the namespace if it's a namespace import
    if (specificType) {
      typeString = typeString.replace(
        fullMatch,
        `${namespace}.${specificType}`
      );
    } else {
      typeString = typeString.replace(fullMatch, namespace);
    }
  }

  // Generate import statements
  for (const [path, imports] of importPaths) {
    if (imports.has("*")) {
      result.imports!.add(`import type * from "${path}"`);
    } else {
      const importList = Array.from(imports).join(", ");
      result.imports!.add(`import type { ${importList} } from "${path}"`);
    }
  }

  result.typeString = typeString.trim();

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

  if (type.getText().includes("import")) {
    return formatImportAndType(type.getText());
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
    propertyResults.flatMap((p) => (p.imports ? Array.from(p.imports) : []))
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
