import {
  type Type,
  type Node,
  type SourceFile,
  SymbolFlags,
  type Signature,
  TypeFlags
} from 'ts-morph';
import type { PseudoBigInt } from 'typescript';

const PRIMITIVE_TYPES = new Set([
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

type FormatFlags = 'remove-undefined-from-intersections' | false;

interface FootprintParams {
  file: SourceFile;
  type: Type;
  node: Node;
  overrides?: Record<string, string>;
  flags?: FormatFlags[];
  depth?: number;
}

interface TypeRepresentation {
  kind: string;
  name?: string;
  properties?: { [key: string]: TypeRepresentation };
  elementType?: TypeRepresentation;
  types?: TypeRepresentation[];
  parameters?: { name: string; type: TypeRepresentation; optional: boolean }[];
  returnType?: TypeRepresentation;
  value?: string | number | boolean | PseudoBigInt;
}

export interface FootprintResult {
  typeRepresentation: TypeRepresentation;
  imports: Set<string>;
}

const processedTypes = new WeakMap<Type, FootprintResult>();

const MAX_DEPTH = 3;

export function footprintOfType({
  file,
  type,
  node,
  overrides = {},
  flags = [],
  depth = 0
}: FootprintParams): FootprintResult {
  if (processedTypes.has(type)) {
    return processedTypes.get(type)!;
  }

  if (depth > MAX_DEPTH) {
    const importInfo = getTypeImport(type, file);
    if (importInfo) {
      return {
        typeRepresentation: { kind: 'import', name: importInfo.typeName },
        imports: importInfo.importStatements
      };
    }
    console.warn(
      `Max depth exceeded for type: ${type.getText()}. Using 'any' instead.`
    );
    return {
      typeRepresentation: { kind: 'primitive', name: 'any' },
      imports: new Set()
    };
  }

  const symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
  if (symbol && overrides[symbol.getName()]) {
    return {
      typeRepresentation: {
        kind: 'override',
        name: overrides[symbol.getName()]
      },
      imports: new Set()
    };
  }

  const next = (
    nextType: Type,
    nextFlags: FormatFlags[] = []
  ): FootprintResult =>
    footprintOfType({
      file,
      type: nextType,
      node,
      overrides,
      flags: [...flags, ...nextFlags],
      depth: depth + 1
    });

  let result: FootprintResult;

  if (isPrimitive(type)) {
    result = formatPrimitive(type);
  } else if (type.isArray()) {
    result = formatArray(type, next);
  } else if (type.isTuple()) {
    result = formatTuple(type, next);
  } else if (isPromise(type)) {
    result = formatPromise(type, next);
  } else if (isSimpleSignature(type)) {
    result = formatSignatures(type.getCallSignatures(), 'type', next);
  } else if (type.isObject()) {
    result = formatObject(type, node, next);
  } else if (type.isUnion()) {
    result = formatUnion(type, flags, next);
  } else if (type.isIntersection()) {
    result = formatIntersection(type, node, flags, next);
  } else {
    const importInfo = getTypeImport(type, file);
    if (importInfo) {
      result = {
        typeRepresentation: { kind: 'import', name: importInfo.typeName },
        imports: importInfo.importStatements
      };
    } else {
      console.warn('Unhandled type:', type.getText());
      result = {
        typeRepresentation: { kind: 'primitive', name: 'any' },
        imports: new Set()
      };
    }
  }

  processedTypes.set(type, result);
  return result;
}

// Helper functions (getTypeImport, isPrimitive, isPromise, isSimpleSignature) remain the same

function formatPrimitive(type: Type): FootprintResult {
  let typeRepresentation: TypeRepresentation;
  if (type.isLiteral()) {
    const literalValue = type.getLiteralValue();
    typeRepresentation = {
      kind: 'literal',
      value: literalValue !== undefined ? literalValue : type.getText()
    };
  } else {
    typeRepresentation = { kind: 'primitive', name: type.getText() };
  }
  return { typeRepresentation, imports: new Set() };
}

function isPromise(type: Type): boolean {
  const symbol = type.getSymbol();
  return (
    type.isObject() &&
    symbol?.getName() === 'Promise' &&
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
function isPrimitive(type: Type): boolean {
  return (
    PRIMITIVE_TYPES.has(type.getText()) ||
    type.isLiteral() ||
    type.isUndefined() ||
    type.isNull() ||
    type.isUnknown() ||
    type.isAny() ||
    type.isVoid() ||
    type.isNever() ||
    !!(type.getFlags() & TypeFlags.BigIntLiteral)
  );
}
function formatArray(
  type: Type,
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const elementType = type.getArrayElementTypeOrThrow();
  const elementResult = next(elementType);
  return {
    typeRepresentation: {
      kind: 'array',
      elementType: elementResult.typeRepresentation
    },
    imports: elementResult.imports
  };
}

interface ImportInfo {
  typeName: string;
  importStatements: Set<string>;
}

function getTypeImport(type: Type, file: SourceFile): ImportInfo | null {
  const typeText = type.getText();
  const imports = new Set<string>();

  // Helper function to add import and return result
  function addImportAndReturn(
    importStatement: string,
    typeName: string
  ): ImportInfo {
    imports.add(importStatement);
    return { typeName, importStatements: imports };
  }

  // Check for import statements within the type (e.g., import("path").Namespace.SubType)
  const importRegex = /import\("([^"]+)"\)\.(\w+)(?:\.)?([\w.]+)?/g;
  let typeName = typeText;
  let matchResult: RegExpExecArray | null;

  while ((matchResult = importRegex.exec(typeText)) !== null) {
    const [fullMatch, importPath, namespace, subType] = matchResult;
    const importStatement = `import { ${namespace} } from '${importPath}';`;
    imports.add(importStatement);
    typeName = typeName.replace(
      fullMatch,
      `${namespace}${subType ? `.${subType}` : ''}`
    );
  }

  // If we found any imports within the type, return the result
  if (imports.size > 0) {
    return { typeName, importStatements: imports };
  }

  // Parse the type into parts (handling namespaces)
  const parts = typeName.split('.');
  const rootType = parts[0];

  const importDeclarations = file.getImportDeclarations();

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    // Check named imports
    for (const namedImport of importDecl.getNamedImports()) {
      const importName = namedImport.getName();
      if (importName === rootType || importName === parts.join('.')) {
        const isTypeOnly = namedImport.isTypeOnly();
        return addImportAndReturn(
          `import ${
            isTypeOnly ? 'type ' : ''
          }{ ${importName} } from '${moduleSpecifier}';`,
          typeName
        );
      }
    }

    // Check default import
    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport && defaultImport.getText() === rootType) {
      return addImportAndReturn(
        `import ${rootType} from '${moduleSpecifier}';`,
        typeName
      );
    }

    // Check namespace import
    const namespaceImport = importDecl.getNamespaceImport();
    if (namespaceImport) {
      const namespaceName = namespaceImport.getText();
      if (namespaceName === rootType) {
        return addImportAndReturn(
          `import * as ${namespaceName} from '${moduleSpecifier}';`,
          typeName
        );
      }
      // Handle case where type is part of a namespace (e.g., MyNamespace.MyType)
      if (parts.length > 1 && namespaceName === parts[0]) {
        return addImportAndReturn(
          `import * as ${namespaceName} from '${moduleSpecifier}';`,
          typeName
        );
      }
    }
  }

  // If we couldn't find an import, return null
  return null;
}

function formatTuple(
  type: Type,
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const tupleResults = type
    .getTupleElements()
    .map((elementType) => next(elementType, []));
  const imports = new Set(tupleResults.flatMap((r) => Array.from(r.imports)));
  const typeRepresentation: TypeRepresentation = {
    kind: 'tuple',
    types: tupleResults.map((r) => r.typeRepresentation)
  };
  return { typeRepresentation, imports };
}

function formatPromise(
  type: Type,
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const promiseType = type.getTypeArguments()[0];
  const promiseResult = next(promiseType);
  return {
    typeRepresentation: {
      kind: 'promise',
      elementType: promiseResult.typeRepresentation
    },
    imports: promiseResult.imports
  };
}

function formatObject(
  type: Type,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
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
      ...propResult
    };
  });

  const imports = new Set(
    propertyResults.flatMap((p) => Array.from(p.imports))
  );
  const typeRepresentation: TypeRepresentation = {
    kind: 'object',
    properties: Object.fromEntries(
      propertyResults.map((p) => [
        p.name,
        { ...p.typeRepresentation, optional: p.optional }
      ])
    )
  };

  return { typeRepresentation, imports };
}

function formatGenericObject(
  type: Type,
  typeArguments: Type[],
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const baseTypeName = type.getSymbol()?.getName() || 'unknown';
  const typeArgResults = typeArguments.map((arg) => next(arg, []));
  const imports = new Set(typeArgResults.flatMap((r) => Array.from(r.imports)));
  const typeRepresentation: TypeRepresentation = {
    kind: 'generic',
    name: baseTypeName,
    types: typeArgResults.map((r) => r.typeRepresentation)
  };
  return { typeRepresentation, imports };
}

function formatUnion(
  type: Type,
  flags: FormatFlags[],
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const results = type
    .getUnionTypes()
    .filter(
      (t) =>
        !flags.includes('remove-undefined-from-intersections') ||
        !t.isUndefined()
    )
    .map((t) => next(t, flags));

  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeRepresentation: TypeRepresentation = {
    kind: 'union',
    types: results.map((r) => r.typeRepresentation)
  };
  return { typeRepresentation, imports };
}

function formatIntersection(
  type: Type,
  node: Node,
  flags: FormatFlags[],
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const intersectionTypes = type.getIntersectionTypes();
  const results = intersectionTypes.map((t) => next(t, flags));

  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeRepresentation: TypeRepresentation = {
    kind: 'intersection',
    types: results.map((r) => r.typeRepresentation)
  };

  return { typeRepresentation, imports };
}

function formatSignatures(
  sigs: Signature[],
  variant: 'type' | 'declaration',
  next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
  const results = sigs.map((sig) => formatSignature(sig, variant, next));
  const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
  const typeRepresentation: TypeRepresentation = {
    kind: 'function',
    parameters: results[0].typeRepresentation.parameters,
    returnType: results[0].typeRepresentation.returnType
  };
  return { typeRepresentation, imports };
}

function formatSignature(
  sig: Signature,
  variant: 'type' | 'declaration',
  next: (type: Type, flags: FormatFlags[]) => FootprintResult,
  methodName?: string,
  flags: FormatFlags[] = []
): FootprintResult {
  const paramResults = sig.getParameters().map((param) => {
    const paramType = param
      .getDeclarations()
      .map((decl) => next(decl.getType(), flags))
      .reduce(
        (acc, curr) => ({
          typeRepresentation: curr.typeRepresentation,
          imports: new Set([...acc.imports, ...curr.imports])
        }),
        { typeRepresentation: { kind: 'unknown' }, imports: new Set<string>() }
      );

    return {
      name: param.getName(),
      optional: param.hasFlags(SymbolFlags.Optional),
      type: paramType.typeRepresentation
    };
  });

  const returnTypeResult = next(sig.getReturnType(), flags);

  const imports = new Set([
    ...paramResults.flatMap((p) => Array.from(p.imports)),
    ...Array.from(returnTypeResult.imports)
  ]);

  const typeRepresentation: TypeRepresentation = {
    kind: 'function',
    parameters: paramResults,
    returnType: returnTypeResult.typeRepresentation
  };

  return { typeRepresentation, imports };
}
