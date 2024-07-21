import {
  Project,
  Type,
  Symbol,
  SymbolFlags,
  Signature,
  Node,
  TypeFormatFlags,
  SourceFile
} from 'ts-morph';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_TSCONFIG_PATH = path.join(__dirname, 'tsconfig.json');

const projectCache = new Map<string, Project>();

function getProject(tsConfigFilePath: string = DEFAULT_TSCONFIG_PATH): Project {
  if (!projectCache.has(tsConfigFilePath)) {
    projectCache.set(tsConfigFilePath, new Project({ tsConfigFilePath }));
  }
  return projectCache.get(tsConfigFilePath)!;
}

export interface TypeFootprintOptions {
  overrides?: Record<string, string>;
  tsConfigFilePath?: string;
}

export function typeFootprint(
  fileName: string,
  typeName: string,
  opts: TypeFootprintOptions = {}
): string {
  const project = getProject(opts.tsConfigFilePath);
  const sourceFile = project.addSourceFileAtPath(fileName);
  const typeAlias = sourceFile.getTypeAliasOrThrow(typeName);
  const type = typeAlias.getType();

  const footprint = footprintOfType({
    file: sourceFile,
    type,
    node: typeAlias,
    overrides: opts.overrides
  });

  return `type ${typeName} = ${footprint}`;
}

const PRIMITIVE_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'undefined',
  'null',
  'unknown',
  'any',
  'void'
]);

function isPrimitive(type: Type): boolean {
  if (PRIMITIVE_TYPES.has(type.getText())) return true;
  return (
    type.isStringLiteral() || type.isNumberLiteral() || type.isBooleanLiteral()
  );
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

type FormatFlags = 'remove-undefined-from-intersections' | false;

interface FootprintParams {
  file: SourceFile;
  type: Type;
  node: Node;
  overrides?: Record<string, string>;
  flags?: FormatFlags[];
  callStackLevel?: number;
}

export function footprintOfType({
  file,
  type,
  node,
  overrides = {},
  flags = [],
  callStackLevel = 0
}: FootprintParams): string {
  if (callStackLevel > 20) return "'...'";

  const symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
  if (symbol && overrides[symbol.getName()]) {
    return overrides[symbol.getName()];
  }

  const next = (nextType: Type, nextFlags: FormatFlags[] = []) =>
    footprintOfType({
      file,
      type: nextType,
      node,
      overrides,
      flags: nextFlags,
      callStackLevel: callStackLevel + 1
    });

  if (isPrimitive(type)) {
    return type.getText(
      node,
      TypeFormatFlags.UseSingleQuotesForStringLiteralType
    );
  }

  if (type.isArray()) {
    const elementType = type.getArrayElementTypeOrThrow();
    return isPrimitive(elementType)
      ? `${next(elementType)}[]`
      : `Array<\n${indent(next(elementType))}\n>`;
  }

  if (type.isObject() && type.getSymbol()?.getName() === 'Date') {
    return 'Date';
  }

  if (type.isTuple()) {
    const tupleElements = type.getTupleElements().map(next);
    return `[\n${indent(tupleElements.join(',\n'))}\n]`;
  }

  if (isPromise(type)) {
    const promiseType = type.getTypeArguments()[0];
    return isPrimitive(promiseType)
      ? `Promise<${next(promiseType)}>`
      : `Promise<\n${indent(next(promiseType))}\n>`;
  }

  if (isSimpleSignature(type)) {
    return formatSignatures(type.getCallSignatures(), 'type', next);
  }

  if (type.isObject()) {
    return formatObject(type, node, next);
  }

  if (type.isUnion()) {
    return formatUnion(type, flags, next);
  }

  if (type.isIntersection()) {
    return formatIntersection(type, node, next);
  }

  const intrinsicName = (type.compilerType as any).intrinsicName;
  if (intrinsicName === 'bigint' || intrinsicName === 'never') {
    return intrinsicName;
  }

  return 'TODO';
}

function indent(text: string, level: number = 1): string {
  return text.replace(/^/gm, ' '.repeat(level * 2));
}

function formatObject(
  type: Type,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  const props = type.getProperties();
  const sigs = type.getCallSignatures();
  const numIndex = type.getNumberIndexType();
  const stringIndex = type.getStringIndexType();

  if (props.length === 0 && sigs.length === 0 && !numIndex && !stringIndex) {
    return '{}';
  }

  const parts = [
    numIndex && `[index: number]: ${next(numIndex)};`,
    stringIndex && `[index: string]: ${next(stringIndex)};`,
    sigs.length > 0 && formatSignatures(sigs, 'declaration', next),
    props.length > 0 && formatProperties(props, node, next)
  ].filter(Boolean);

  return `{\n${indent(parts.join('\n'))}\n}`;
}

function formatUnion(
  type: Type,
  flags: FormatFlags[],
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  return type
    .getUnionTypes()
    .filter(
      (t) =>
        !flags.includes('remove-undefined-from-intersections') ||
        !t.isUndefined()
    )
    .map((t) => next(t))
    .join(' | ');
}

function formatIntersection(
  type: Type,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  const allProps = type
    .getIntersectionTypes()
    .flatMap((t) => (t.isObject() ? t.getProperties() : []));

  return `{\n${formatProperties(allProps, node, next)}\n}`;
}

const ARRAY_PROPS = new Set(Object.getOwnPropertyNames(Array.prototype));
const RECURSIVE_PRISMA_PROPS = new Set([
  'locked',
  'create',
  'AND',
  'OR',
  'createMany',
  'set',
  'connect',
  'disconnect',
  'connectOrCreate',
  'update',
  'upsert',
  'delete',
  'updateMany',
  'deleteMany'
]);

function formatProperties(
  props: Symbol[],
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  return props
    .filter((prop) => {
      if (prop.getValueDeclaration()?.getType().getCallSignatures().length)
        return false;
      const declaration = prop.getValueDeclaration();
      if (Node.isIndexSignatureDeclaration(declaration)) return false;
      if (prop.getDeclarations().some(Node.isMethodDeclaration)) return false;
      const name = prop.getName();
      if (name.startsWith('__@') || RECURSIVE_PRISMA_PROPS.has(name))
        return false;
      return true;
    })
    .map((prop) => formatProperty(prop, node, next))
    .join('\n');
}

function formatProperty(
  prop: Symbol,
  node: Node,
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  const type = prop.getTypeAtLocation(node);
  const sigs = type.getCallSignatures();
  const firstSig = sigs[0];

  if (
    isSimpleSignature(type) &&
    !prop.hasFlags(SymbolFlags.Optional) &&
    firstSig
  ) {
    return formatSignature(firstSig, 'declaration', next, prop.getName()) + ';';
  }

  const isOptional = prop.hasFlags(SymbolFlags.Optional);
  return `${prop.getName()}${isOptional ? '?' : ''}: ${next(type, [
    isOptional && 'remove-undefined-from-intersections'
  ])};`;
}

function formatSignatures(
  sigs: Signature[],
  variant: 'type' | 'declaration',
  next: (type: Type, flags: FormatFlags[]) => string
): string {
  return sigs.map((sig) => formatSignature(sig, variant, next)).join('\n');
}

function formatSignature(
  sig: Signature,
  variant: 'type' | 'declaration',
  next: (type: Type, flags: FormatFlags[]) => string,
  methodName?: string
): string {
  const name = sig.getDeclaration().getSymbol()?.getName();
  const nameToUse =
    methodName ?? (['__type', '__call'].includes(name ?? '') ? '' : name);
  const params = sig
    .getParameters()
    .map((param) => {
      const paramType = param
        .getDeclarations()
        .map((decl) => next(decl.getType(), []))
        .join(',');
      return `${param.getName()}${
        param.hasFlags(SymbolFlags.Optional) ? '?' : ''
      }: ${paramType}`;
    })
    .join(', ');

  return `${variant === 'declaration' ? nameToUse : ''}(${params})${
    variant === 'declaration' ? ': ' : ' => '
  }${next(sig.getReturnType(), [])}`;
}
