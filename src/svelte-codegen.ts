import {
	Project,
	Type,
	Symbol,
	SymbolFlags,
	Signature,
	Node,
	TypeFormatFlags,
	SourceFile,
	TypeAliasDeclaration
} from 'ts-morph'
import { fileURLToPath } from 'url'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultTsConfigFilePath = path.join(__dirname, 'tsconfig.json')

const projects = new Map<string, Project>()

const project = (tsConfigFilePath: string) => {
	const project = projects.get(tsConfigFilePath)
	const result =
		project ??
		new Project({
			tsConfigFilePath
		})
	projects.set(tsConfigFilePath, result)
	return result
}

/**
 * You have a type A that depends on type C that depends on type B through
 * a complex or just somewhat complex set of manipulations - Pick, Omit,
 * typeof const or whatever else.
 *
 * You want to make it visible that changes in type B change type A in
 * a more explicit way.
 *
 * Solution:
 * Create a test where you have a snapshot of a type which turns a complex type
 * into plain structure without all the complexities. That is - when type B changes
 * you would explicitly see all the types/interfaces it affected.
 */
export function typeFootprint(
	fileName: string,
	typeName: string,
	opts?: {
		// NOTE: because TypeScript does interning for equivalent types
		// some aliases are going to be erased and unavailable - so it wouldn't
		// be possible to override output for any type we wish, but should be possible
		// for top-level types and types containing this: Type & { _SpecialType?: undefined }
		// for more information: https://stackoverflow.com/questions/64745962/use-typescript-compiler-api-to-get-the-type-alias-declaration-node-from-a-type-r
		overrides?: Record<string, string>
		tsConfigFilePath?: string
	}
) {
	const p = project(opts?.tsConfigFilePath ?? defaultTsConfigFilePath)
	const s = p.addSourceFileAtPath(fileName)
	const a = s.getTypeAliasOrThrow(typeName)
	const t = a.getType()

	const text = footprintOfType({
		file: s,
		type: t,
		node: a,
		overrides: opts?.overrides
	})

	return `type ${typeName} = ` + text
}

function isPrimitive(type: Type) {
	if (type.isString()) {
		return true
	}
	if (type.isStringLiteral()) {
		return true
	}
	if (type.isUndefined()) {
		return true
	}
	if (type.isNull()) {
		return true
	}
	if (type.isUnknown()) {
		return true
	}
	if (type.isAny()) {
		return true
	}
	if (type.isNumber()) {
		return true
	}
	if (type.isNumberLiteral()) {
		return true
	}
	if (type.isBoolean()) {
		return true
	}
	if (type.isBooleanLiteral()) {
		return true
	}
	if (intrinsicNameOf(type) === 'void') {
		// isVoid
		return true
	}
	return false
}

function isPromise(type: Type) {
	const symbol = type.getSymbol()
	if (!type.isObject() || !symbol) {
		return false
	}
	const args = type.getTypeArguments()
	return symbol.getName() === 'Promise' && args.length === 1
}

function isSimpleSignature(type: Type) {
	if (!type.isObject()) {
		return false
	}
	const sigs = type.getCallSignatures()
	const props = type.getProperties()
	const args = type.getTypeArguments()
	const indexType = type.getNumberIndexType()
	const stringType = type.getStringIndexType()
	return sigs.length === 1 && props.length === 0 && args.length === 0 && !indexType && !stringType
}

function intrinsicNameOf(type: Type) {
	return (type.compilerType as unknown as { intrinsicName: string }).intrinsicName
}

type FormatFlags =
	| false // <- to be able to pass down conditional flags
	| 'remove-undefined-from-intersections'

export function footprintOfType(params: {
	file: SourceFile
	type: Type
	node: Node
	overrides?: Record<string, string>
	flags?: FormatFlags[]
	callStackLevel?: number
}): string {
	const { file, type, node, overrides, flags = [], callStackLevel = 0 } = params

	if (callStackLevel > 20) {
		// too deep?
		return "'...'"
	}

	// TODO: handle type references
	// if (type.getText().includes('Params')) {
	// 	// get type node
	// 	type.getSymbol()?.getDeclarations()?.forEach((d) => {
	// 		if (TypeAliasDeclaration.is(d.getKind())) {
	// 			console.log(d.getText())
	// 		}
	// 	})
		
	// }

	const next = (nextType: Type, nextFlags: FormatFlags[] = []) => {
		return footprintOfType({
			file,
			type: nextType,
			node,
			overrides,
			flags: nextFlags,
			callStackLevel: callStackLevel + 1
		})
	}

	const indent = (text: string, lvl: number = 1) => text.replace(/^/gm, ' '.repeat(lvl * 2))

	const defaultFormat = () => {
		return type.getText(node, TypeFormatFlags.UseSingleQuotesForStringLiteralType)
	}

	const symbol = type.isEnum() ? type.getSymbol() : type.getAliasSymbol();
	if (overrides && symbol) {
		const result = overrides[symbol.getName()]
		if (result) {
			return result
		}
	}

	// if (type.isEnum()) {
	// 	return symbol ? symbol.getName() : defaultFormat();
	// }

	if (isPrimitive(type)) {
		return defaultFormat()
	}

	if (type.isArray()) {
		const subType = type.getArrayElementTypeOrThrow()
		if (isPrimitive(subType)) {
			return `${next(subType)}[]`
		} else {
			return `Array<\n${indent(next(subType))}\n>`
		}
	}

	// if it's date
	if (type.isObject() && type.getSymbol()?.getName() === 'Date') {
		return 'Date'
	}

	if (type.isTuple()) {
		const types = type.getTupleElements()
		return ['[\n', indent(types.map((type) => next(type)).join(',\n')), '\n]'].join('')
	}

	if (type.isObject() && isPromise(type)) {
		const first = type.getTypeArguments()[0]
		if (!first) {
			throw new Error('This should not have happened')
		}
		if (isPrimitive(first)) {
			return `Promise<${next(first)}>`
		} else {
			return `Promise<\n${indent(next(first))}\n>`
		}
	}

	if (type.isObject() && isSimpleSignature(type)) {
		
		return signatures(type.getCallSignatures(), 'type', next)
	}

	

	if (type.isObject()) {
		
		const props = type.getProperties()
		
		const sigs = type.getCallSignatures()
		const numIndex = type.getNumberIndexType()
		const stringIndex = type.getStringIndexType()
		if (props.length === 0 && sigs.length === 0 && !numIndex && !stringIndex) {
			return '{}'
		}
		const sigsText = signatures(sigs, 'declaration', next)
		const propsText = properties(props, node, next)
		const numIndexText = numIndex && `[index: number]: ${next(numIndex)};`
		const stringIndexText = stringIndex && `[index: string]: ${next(stringIndex)};`
		return [
			'{\n',
			numIndexText && indent(numIndexText),
			stringIndexText && indent(stringIndexText),
			sigs.length > 0 && indent(sigsText),
			props.length > 0 && indent(propsText),
			'\n}'
		]
			.filter(Boolean)
			.join('')
	}

	if (type.isUnion()) {
		return type
			.getUnionTypes()
			.filter((type) => {
				if (flags.includes('remove-undefined-from-intersections')) {
					return !type.isUndefined()
				}
				return true
			})
			.map((type) => next(type))
			.join(' | ')
	}

	if (type.isIntersection()) {
		const allProps: Symbol[] = []

		for (const intersectedType of type.getIntersectionTypes()) {
			if (intersectedType.isObject()) {
				const props = intersectedType.getProperties()
				allProps.push(...props)
			}
			// ... handle other type kinds if needed
		}

		return `{ \n${properties(allProps, node, next)}\n }`

		return type
			.getIntersectionTypes()
			.map((type) => next(type))
			.join(' & ')
	}

	// if bigint
	if (intrinsicNameOf(type) === 'bigint') {
		return 'bigint'
	}

	// if never
	if (intrinsicNameOf(type) === 'never') {
		return 'never'
	}

	// when you encounter this, consider changing the function
	return 'TODO'
}

const arrayProps = Object.getOwnPropertyNames(Array.prototype).map(
	(name) => name as keyof Array<any>
)
const recursivePrismaProps = [
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
]

function properties(
	props: Symbol[],
	node: Node,
	next: (type: Type, flags: FormatFlags[]) => string
) {
	return props
		.filter((prop) => !prop.getValueDeclaration()?.getType().getCallSignatures().length)
		.filter((prop) => {
			// Filter out index signatures
			const declaration = prop.getValueDeclaration()
			if (declaration && Node.isIndexSignatureDeclaration(declaration)) {
				return false
			}

			// if the prop is a method, skip it
			if (prop.getDeclarations().some((declaration) => Node.isMethodDeclaration(declaration))) {
				return false
			}

			// Filter out internal symbols
			const name = prop.getName()
			if (
				name.startsWith('__@') ||
				// arrayProps.includes(name) ||
				recursivePrismaProps.includes(name)
			) {
				return false
			}

			return true
		})

		.map((value) => property(value, node, next))
		.join('\n')
}

function property(
	prop: Symbol,
	node: Node,
	next: (type: Type, flags: FormatFlags[]) => string
): string {
	const type = prop.getTypeAtLocation(node)
	const sigs = type.getCallSignatures()
	const firstSig = sigs?.[0]
	if (isSimpleSignature(type) && !prop.hasFlags(SymbolFlags.Optional) && firstSig) {
		return signature(firstSig, 'declaration', next, prop.getName()) + ';'
	}
	const isOptional = prop.hasFlags(SymbolFlags.Optional)
	return [
		prop.getName(),
		isOptional ? '?' : '',
		': ',
		next(type, [isOptional && 'remove-undefined-from-intersections']),
		';'
	].join('')
}

function signatures(
	sigs: Signature[],
	variant: 'type' | 'declaration',
	next: (type: Type, flags: FormatFlags[]) => string
) {
	return sigs.map((sig) => signature(sig, variant, next)).join('\n')
}

function signature(
	sig: Signature,
	variant: 'type' | 'declaration',
	next: (type: Type, flags: FormatFlags[]) => string,
	methodName?: string
): string {
	
	const name = sig.getDeclaration().getSymbol()?.getName()
	const nameToUse = methodName ?? (['__type', '__call'].includes(name ?? '') ? '' : name)
	const params = sig.getParameters()
	return [
		variant === 'declaration' ? nameToUse : '',
		'(',
		params
			.map((param) =>
				[
					param.getName(),
					param.hasFlags(SymbolFlags.Optional) ? '?' : '',
					': ',
					param
						.getDeclarations()
						.map((decl) => next(decl.getType(), []))
						.join(',')
				].join('')
			)
			.join(', '),
		')',
		variant === 'declaration' ? ': ' : ' => ',
		next(sig.getReturnType(), [])
	].join('')
}
