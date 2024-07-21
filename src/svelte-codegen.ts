import {
	Type,
	Node,
	TypeFormatFlags,
	SourceFile,
	Symbol,
	SymbolFlags,
	Signature,
	TypeFlags,
} from "ts-morph";

const PRIMITIVE_TYPES = new Set([
	"string",
	"number",
	"boolean",
	"undefined",
	"null",
	"unknown",
	"any",
	"void",
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

interface FootprintResult {
	typeString: string;
	imports: Set<string>;
}

const processedTypes = new WeakMap<Type, FootprintResult>();

const MAX_DEPTH = 5; // Adjust this value as needed

export function footprintOfType({
	file,
	type,
	node,
	overrides = {},
	flags = [],
	depth = 0,
}: FootprintParams): FootprintResult {
	// Check if we've already processed this type
	if (processedTypes.has(type)) {
		return processedTypes.get(type)!;
	}

	if (depth > MAX_DEPTH) {
		// If we've exceeded the maximum depth, try to import the type instead
		const importInfo = getTypeImport(type, file);
		if (importInfo) {
      console.warn(importInfo)
			return {
				typeString: importInfo.typeName,
				imports: new Set([importInfo.importStatement]),
			};
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
			depth: depth + 1,
		});

	let result: FootprintResult = { typeString: "", imports: new Set() };

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
	} else if (type.isArray()) {
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
	} else if (isPromise(type)) {
		const promiseType = type.getTypeArguments()[0];
		const promiseResult = next(promiseType);
		result.imports = promiseResult.imports;
		result.typeString = isPrimitive(promiseType)
			? `Promise<${promiseResult.typeString}>`
			: `Promise<\n${indent(promiseResult.typeString)}\n>`;
	} else if (isSimpleSignature(type)) {
		result = formatSignatures(type.getCallSignatures(), "type", next);
	} else if (type.isObject()) {
		result = formatObject(type, node, next);
	} else if (type.isUnion()) {
		result = formatUnion(type, flags, next);
	} else if (type.isIntersection()) {
		result = formatIntersection(type, node, flags, next);
	} else {
		const importInfo = getTypeImport(type, file);

		if (importInfo) {
			result.typeString = importInfo.typeName;
			if (importInfo.importStatement) {
				result.imports.add(importInfo.importStatement);
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

interface ImportInfo {
	typeName: string;
	importStatement: string;
}

function getTypeImport(type: Type, file: SourceFile): ImportInfo | null {
	const typeText = type.getText();
	const parts = typeText.split(".");
	const rootType = parts[0];

	const importDeclarations = file.getImportDeclarations();

	for (const importDecl of importDeclarations) {
		const namedImports = importDecl.getNamedImports();
		const defaultImport = importDecl.getDefaultImport();
		const namespaceImport = importDecl.getNamespaceImport();

		// Check named imports
		for (const namedImport of namedImports) {
			if (namedImport.getName() === rootType) {
				const moduleSpecifier = importDecl.getModuleSpecifierValue();
				const isTypeOnly = namedImport.isTypeOnly();
				return {
					typeName: typeText,
					importStatement: `import ${
						isTypeOnly ? "type " : ""
					}{ ${rootType} } from '${moduleSpecifier}';`,
				};
			}
		}

		// Check default import
		if (defaultImport && defaultImport.getText() === rootType) {
			const moduleSpecifier = importDecl.getModuleSpecifierValue();
			return {
				typeName: typeText,
				importStatement: `import ${rootType} from '${moduleSpecifier}';`,
			};
		}

		// Check namespace import
		if (namespaceImport && namespaceImport.getText() === rootType) {
			const moduleSpecifier = importDecl.getModuleSpecifierValue();
			return {
				typeName: typeText,
				importStatement: `import * as ${rootType} from '${moduleSpecifier}';`,
			};
		}
	}

	// If we couldn't find an import, it might be a global type or from a file that's not directly imported.
	// In this case, we'll return the type as-is without an import statement.
	return {
		typeName: typeText,
		importStatement: "",
	};
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
		type.getFlags() & TypeFlags.BigIntLiteral
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
	next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
	const results = sigs.map((sig) => formatSignature(sig, variant, next));
	const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
	const typeString = results.map((r) => r.typeString).join("\n");
	return { typeString, imports };
}

function formatObject(
	type: Type,
	node: Node,
	next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
	const props = type.getProperties();
	const sigs = type.getCallSignatures();
	const numIndex = type.getNumberIndexType();
	const stringIndex = type.getStringIndexType();

	if (props.length === 0 && sigs.length === 0 && !numIndex && !stringIndex) {
		return { typeString: "{}", imports: new Set() };
	}

	const parts: FootprintResult[] = [
		...(numIndex ? [next(numIndex, [])] : []),
		...(stringIndex ? [next(stringIndex, [])] : []),
		...(sigs.length > 0 ? [formatSignatures(sigs, "declaration", next)] : []),
		...(props.length > 0 ? [formatProperties(props, node, next)] : []),
	];

	const imports = new Set(parts.flatMap((p) => Array.from(p.imports)));
	const typeString = `{\n${indent(
		parts.map((p) => p.typeString).join("\n")
	)}\n}`;

	return { typeString, imports };
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
	next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
	const results = type.getIntersectionTypes().map((t) => next(t, flags));

	const imports = new Set(results.flatMap((r) => Array.from(r.imports)));
	const typeString = `{\n${indent(
		results.map((r) => r.typeString).join("\n")
	)}\n}`;
	return { typeString, imports };
}

function formatProperty(
	prop: Symbol,
	node: Node,
	next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
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
	next: (type: Type, flags: FormatFlags[]) => FootprintResult
): FootprintResult {
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
	next: (type: Type, flags: FormatFlags[]) => FootprintResult,
	methodName?: string,
	flags: FormatFlags[] = []
): FootprintResult {
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
