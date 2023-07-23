import * as commentParser from 'comment-parser'

import * as fs from 'fs'
import inquirer from 'inquirer'
import { parseSchema } from 'json-schema-to-zod'
import * as os from 'os'
import * as path from 'path'

import { resolve } from 'path'
import {
	CallExpression,
	CatchClause,
	ExportedDeclarations,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration,
	Node,
	ObjectLiteralExpression,
	Project,
	SourceFile,
	StringLiteral,
	SyntaxKind,
	TypeAliasDeclaration,
	TypeNode,
	TypeReferenceNode,
	VariableDeclaration,
	VariableStatement
} from 'ts-morph'
import * as TJS from 'typescript-json-schema'
import { v4 as uuidv4 } from 'uuid'
import { footprintOfType } from './svelte-codegen'
const workingDir = process.env.PWD!

const separator = `--------------------------------------`

// process.on('SIGUSR2', function () {
//   const snapshotFile = '/path/to/your/project/heap-' + Date.now() + '.heapsnapshot';
//   heapdump.writeSnapshot(snapshotFile, (err) => {
//     if (err) console.error(err);
//     else console.log(`Heap dump written to ${snapshotFile}`);
//   });
// });

// this won't send if you disable telemetry
let telemetryPayload: Telemetry = {
	_id: uuidv4(),
	// read from svelte.config.js
	project: workingDir.split('/').pop()!,
	timestamp: Date.now(),
	data: {
		session_id: uuidv4(),
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
}

class Log {
	private console_colors = {
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		gray: '\x1b[90m',
		reset: '\x1b[0m',
		black: '\x1b[30m'
	}

	private logLevel: number
	private filter: string | null

	constructor(logLevel: number = 5, filter: string | null = null) {
		// default log level is 5, which shows all logs
		this.logLevel = logLevel
		this.filter = filter
	}

	private log(color: keyof typeof this.console_colors, nesting: number = 1, ...args: any[]) {
		const formattedArgs = args.map((arg) => {
			if (typeof arg === 'object') {
				// Convert the object to a JSON string with 2-space indentation
				let json = JSON.stringify(arg, null, 2)
				// Split the JSON string into lines so we can add indentation to each line
				let lines = json.split('\n')
				// Add the appropriate indentation to each line
				let padding = '    '.repeat(nesting)
				lines = lines.map((line) => {
					// Check if line is a valid JSON string, if so parse it
					try {
						const parsedJSON = JSON.parse(line.trim())
						// If it's parsable, it's a stringified JSON, so we format it with the appropriate indentation
						return padding + JSON.stringify(parsedJSON, null, 2).replace(/\n/g, '\n' + padding)
					} catch (e) {
						// If it's not parsable, it's a regular string so we just return it
						return padding + line
					}
				})
				// Join the lines back together into a single string
				return lines.join('\n')
			} else {
				// Non-object arguments are not modified
				return arg
			}
		})

		console.log(
			`${this.console_colors[color]}${'    '.repeat(nesting - 1)}${
				nesting > 1 ? '↳  ' : ''
			}${formattedArgs.join(' ')}${this.console_colors.reset}`
		)
	}

	header(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 0 && (!this.filter || this.filter === 'header')) {
			this.log('cyan', nesting, ...args)
		}
	}

	success(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 1 && (!this.filter || this.filter === 'success')) {
			this.log('green', nesting, '✅ [SUCCESS]:	', ...args)
		}
	}

	info(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 2 && (!this.filter || this.filter === 'info')) {
			this.log('blue', nesting, '🗒 [INFO]:	', ...args)
		}
	}

	warn(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 3 && (!this.filter || this.filter === 'warn')) {
			this.log('yellow', nesting, '⚠️ [WARN]:	', ...args)
		}
	}

	error(nesting: number = 1, ...args: any[]) {
		telemetryPayload.data.encountered_errors = true
		telemetryPayload.data.error_messages.push(args.join(' '))
		if (this.logLevel >= 4 && (!this.filter || this.filter === 'error')) {
			this.log('red', nesting, '🚨 [ERROR]:	', ...args)
		}
	}

	debug(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 5 && (!this.filter || this.filter === 'debug')) {
			this.log('gray', nesting, '🐛 [DEBUG]:	', ...args)
		}
	}
}

interface ScriptArgs {
	framework: string
	input: string
	staticFolder: string
	out: string
	docs: string
	tsconfig: string
	logLevel?: number
	filter?: string | null
	telemetry: boolean
}

function readSvetchrc() {
	try {
		const config = fs.readFileSync('.svetchrc', 'utf8')
		return JSON.parse(config)
	} catch (error) {
		console.error('Error reading .svetchrc file:', error)
		process.exit(1)
	}
}

const defaultArgs: ScriptArgs = {
	framework: 'sveltekit',
	input: 'src/routes/api',
	out: 'src/lib/api',
	docs: 'src/routes/docs',
	staticFolder: 'static',
	tsconfig: 'tsconfig.json',
	logLevel: 5,
	filter: null,
	telemetry: true
}

async function initSvetchrc() {
	// Check if the configuration file already exists

	console.log(`
  _____               _          _     
 / ____|             | |        | |    
| (___  __   __  ___ | |_   ___ | |__  
 \\___ \\ \\ \\ / / / _ \\| __| / __|| '_ \\ 
 ____) | \\ V / |  __/| |_ | (__ | | | |
|_____/   \\_/   \\___| \\__| \\___||_| |_|
                                       
Send any feedback or issues here 👉 https://github.com/Bewinxed/svetch/
`)

	console.log(`${separator}\nTypesafety, without the typing ;)\n${separator}\n`)

	if (fs.existsSync('.svetchrc')) {
		fs.renameSync('.svetchrc', '.svetchrc.backup')
		console.log('Existing .svetchrc file has been renamed to .svetchrc.backup')
	}

	// Ask for configuration options
	const responses: ScriptArgs = await inquirer.prompt([
		// {
		//   name: 'framework',
		//   message: 'What is your framework?',
		//   default: defaultArgs.framework,
		// },
		{
			name: 'input',
			message: `Which folder would you like svetch to scan for API routes? - default: ${defaultArgs.input}`,
			default: defaultArgs.input
		},
		{
			name: 'out',
			message: `${separator}\nWhere would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here) - default: ${defaultArgs.out}`,
			default: defaultArgs.out
		},
		{
			name: 'docs',
			message: `${separator}\nWhere would you like svetch to output the generated API documentation? - default: ${defaultArgs.docs}`,
			default: defaultArgs.docs
		},
		{
			name: 'staticFolder',
			message: `${separator}\nWhere is your static folder located?\n - default: ${defaultArgs.staticFolder}`,
			default: defaultArgs.staticFolder
		}
	])

	fs.writeFileSync('.svetchrc', JSON.stringify({ ...defaultArgs, ...responses }, null, 2))
	log.success(
		1,
		`Svetch configuration written to ${path.resolve(
			workingDir,
			'.svetchrc'
		)}\n\nenjoy ;)\n\n${separator}`
	)
}

const isInit = process.argv[2] === 'init'

// Get the command-line arguments
const args: string[] = process.argv.slice(3) // Exclude the first two elements (node binary and script file path)

function parseArgs(rawArgs: string[]): ScriptArgs {
	// Check if .svetchrc file exists
	const svetchrcExists = fs.existsSync('.svetchrc')
	// Use .svetchrc file if it exists
	const parsedArgs = svetchrcExists ? readSvetchrc() : {}

	// Parse command-line arguments
	for (let i = 0; i < rawArgs.length; i += 2) {
		const argName = rawArgs[i].replace('--', '')
		const argValue = rawArgs[i + 1]
		parsedArgs[argName] = argValue
	}

	// Merge parsed arguments with default values
	return { ...defaultArgs, ...parsedArgs }
}

const { tsconfig, framework, input, out, logLevel, filter, docs, staticFolder, telemetry } =
	parseArgs(args)

const project = new Project({
	compilerOptions: { allowJs: true },
	tsConfigFilePath: tsconfig
})

const typeChecker = project.getTypeChecker()

const log = new Log(logLevel, filter)

project.addSourceFilesAtPaths([`${input}/**/*+server.ts`])

// Change output path here:
const outputPath = path.join(workingDir, out)
const schemaOutputPath = path.join(workingDir, staticFolder)
const docsOutputPath = path.join(workingDir, docs)

let endpoints: Record<string, Record<string, any>> = {}
let actions: Record<string, Record<string, any>> = {}
let importMap = {}

function processTypeNode(node: TypeNode): string {
	if (Node.isTypeReference(node)) {
		let refNode = node as TypeReferenceNode
		const typeArguments = refNode.getTypeArguments()

		if (typeArguments.length > 0) {
			return footprintOfType({
				file: refNode.getSourceFile(),
				type: node.getType(),
				node: node
			})
		}
	}

	if (Node.hasStructure(node)) {
		return footprintOfType({
			file: node.getSourceFile(),
			type: node.getType(),
			node: node
		})
	}

	if (node.getText().includes('Prisma')) {
		return footprintOfType({
			file: node.getSourceFile(),
			type: node.getType(),
			node: node
		})
	}

	// Check if the node is an object literal expression
	if (Node.isObjectLiteralExpression(node)) {
		let objectLiteralNode = node as ObjectLiteralExpression
		// Initialize an empty object to hold the inferred types
		let inferredTypes: Record<string, any> = {}

		// Iterate over the properties of the object literal
		for (const property of objectLiteralNode.getProperties()) {
			// log.debug(2, property.getText())
			if (Node.isPropertyAssignment(property)) {
				let initializer = property.getInitializer()

				let keyname: string
				try {
					keyname = property.getFirstChildByKind(SyntaxKind.ComputedPropertyName)
						? property
								.getFirstChildByKind(SyntaxKind.ComputedPropertyName)
								?.getText()
								.replace(
									property
										.getFirstChildByKind(SyntaxKind.ComputedPropertyName)
										?.getFirstChildByKind(SyntaxKind.Identifier)
										?.getText(),
									`${property
										.getFirstChildByKind(SyntaxKind.ComputedPropertyName)
										?.getFirstChildByKind(SyntaxKind.Identifier)
										?.getText()}: string`
								)
						: property.getName()
				} catch (e) {
					keyname = property.getName()
				}

				// if (node.getText().includes('nftAddress')) {
				// 	console.log('keyname', keyname);
				// 	console.log(property.getKindName());
				// 	// print type of each descendant
				// 	node.forEachDescendant((node) => {
				// 		console.log(node.getText(), node.getKindName());
				// 	});

				// 	process.exit(1);
				// }

				if (!initializer) {
					continue
				}
				if (
					apiParams[node.getSourceFile().getFilePath()] &&
					apiParams[node.getSourceFile().getFilePath()]
						.getText()
						.includes(initializer?.getText().replace('params.', ''))
				) {
					inferredTypes[keyname] = 'string'
					continue
				}

				inferredTypes[keyname] = typeChecker.getTypeAtLocation(initializer)?.getText()

				// If the initializer of the property is a property access expression,
				// infer its type and add it to the inferredTypes object
				if (Node.isPropertyAccessExpression(initializer)) {
					inferredTypes[keyname] = typeChecker.getTypeAtLocation(property).getText() || 'any'
				}
			}
		}

		// console.log(apiParams[node.getSourceFile().getFilePath()].getText())

		// if there's any 'any' type, console log it
		for (const key in inferredTypes) {
			if (inferredTypes[key] === 'any') {
				log.warn(3, `'any' type detected in ${node.getSourceFile().getFilePath()}`)
			}
		}

		return inferredTypes as any
	}

	return node.getText()
}

function extractPathParams(path: string) {
	const params = path.match(/:([^/]+)/g)
	let pathParamsStr = ''

	if (params) {
		for (const param of params) {
			pathParamsStr += `${param.slice(1)}: string; `
		}
	}

	return `{ ${pathParamsStr} }`
}

function extractQueryParameters(declaration: FunctionDeclaration): string {
	const queryParameters: Record<string, string> = {}

	let searchParamsVariables = new Set()

	declaration.forEachDescendant((node: Node) => {
		// Detect any declaration of url.searchParams and store the variable name
		if (node.getKind() === SyntaxKind.VariableDeclaration) {
			const variableDeclaration = node.asKindOrThrow(SyntaxKind.VariableDeclaration)
			const initializer = variableDeclaration.getInitializer()

			if (initializer && Node.isPropertyAccessExpression(initializer)) {
				const expression = initializer.getExpression()
				const property = initializer.getName()

				if (expression.getText() === 'url' && property === 'searchParams') {
					const variableName = variableDeclaration.getName()
					searchParamsVariables.add(variableName)
				}
			}
		}

		// Detect usage of url.searchParams.get(x) or variable.get(x) or variable[x]
		if (Node.isCallExpression(node) || Node.isElementAccessExpression(node)) {
			let expression = node.getExpression()

			if (Node.isPropertyAccessExpression(expression)) {
				const object = expression.getExpression()
				const property = expression.getName()

				if (
					(object.getText() === 'url.searchParams' && property === 'get') ||
					(searchParamsVariables.has(object.getText()) && property === 'get')
				) {
					const args = node.getArguments()

					if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
						const queryParameterName = (args[0] as StringLiteral).getLiteralText()
						queryParameters[queryParameterName] = typeChecker.getTypeAtLocation(node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)).getText()
					}
				}
			} else if (Node.isElementAccessExpression(expression)) {
				const expressionName = expression.getExpression().getText()

				if (searchParamsVariables.has(expressionName)) {
					const argumentExpression = expression.getArgumentExpression()
					if (argumentExpression && argumentExpression.getKind() === SyntaxKind.StringLiteral) {
						const queryParameterName = (argumentExpression as StringLiteral).getLiteralText()
						queryParameters[queryParameterName] = typeChecker
							.getTypeAtLocation(argumentExpression)
							.getText()
					}
				}
			}
		}

		// Get the type of the constant when the query string is assigned to it
		if (node.getKind() === SyntaxKind.VariableDeclaration) {
			const variableDeclaration = node.asKindOrThrow(SyntaxKind.VariableDeclaration)
			const initializer = variableDeclaration.getInitializer()

			if (
				initializer &&
				(Node.isCallExpression(initializer) || Node.isElementAccessExpression(initializer))
			) {
				const expression = initializer.getExpression()

				if (Node.isPropertyAccessExpression(expression)) {
					const object = expression.getExpression()
					const property = expression.getName()

					if (
						(object.getText() === 'url.searchParams' && property === 'get') ||
						(searchParamsVariables.has(object.getText()) && property === 'get')
					) {
						const variableType = typeChecker.getTypeAtLocation(variableDeclaration)
						const variableName = variableDeclaration.getName()
						queryParameters[variableName] = variableType.getText()
					}
				} else if (Node.isElementAccessExpression(expression)) {
					const expressionName = expression.getExpression().getText()

					if (searchParamsVariables.has(expressionName)) {
						const variableType = typeChecker.getTypeAtLocation(variableDeclaration)
						const variableName = variableDeclaration.getName()
						queryParameters[variableName] = variableType.getText()
					}
				}
			}
		}
	})

	let queryTypeString = '{ '
	for (const parameterName in queryParameters) {
		// if nullable
		queryTypeString += `${parameterName}${
			queryParameters[parameterName].includes('null') ||
			queryParameters[parameterName].includes('undefined') ||
			queryParameters[parameterName].includes('never')
				? '?'
				: ''
		}: ${queryParameters[parameterName]}; `
	}
	queryTypeString += '}'

	return queryTypeString
}

function warnIfResultsNotUsedInResponse(declaration: FunctionDeclaration): void {
	const resultsName = 'results'
	let isResultsUsedInResponse = false

	declaration.forEachDescendant((node: Node) => {
		if (Node.isCallExpression(node)) {
			const expression = node.getExpression()

			// Check if the call expression is 'json' or 'Response'
			if (
				Node.isIdentifier(expression) &&
				(expression.getText() === 'json' || expression.getText() === 'Response')
			) {
				// Check if 'results' is used in the arguments
				const args = node.getArguments()
				for (const arg of args) {
					if (arg.getText().includes(resultsName)) {
						isResultsUsedInResponse = true
						break
					}
				}
			}
		}
	})

	// If 'results' is not used in any 'json' or 'Response' call, log a warning
	if (!isResultsUsedInResponse) {
		log.warn(
			3,
			`		[WARN]: 'results' is not used in a 'json' or 'Response' function call in
				 ${declaration.getFunctions()?.at(0)?.getName()}`
		)
	}
}

function extractCatchThrowDetails(
	node: Node
): { status: string; message: string; type: string } | null {
	if (Node.isCatchClause(node)) {
		// log types of all children
		const throwBlock = node.getFirstChildByKind(SyntaxKind.Block)
		if (!throwBlock) {
			return null
		}
		const throwStatement = throwBlock.getFirstChildByKind(SyntaxKind.ThrowStatement)
		if (throwStatement) {
			const callExpression = throwStatement.getFirstChildByKind(SyntaxKind.CallExpression)
			if (callExpression && Node.isCallExpression(callExpression)) {
				const args = callExpression.getArguments()
				if (
					args.length >= 2 &&
					Node.isNumericLiteral(args[0]) &&
					Node.isTemplateExpression(args[1])
				) {
					let type = 'unknown'
					const catchClause = node as CatchClause
					const errorVariableDeclaration = catchClause.getVariableDeclaration()
					if (errorVariableDeclaration) {
						const errorVariableType = errorVariableDeclaration.getType()
						if (errorVariableType) {
							type = errorVariableType.getText()
						}
					}
					return {
						status: args[0].getText(),
						message: args[1].getText().replace('${e}', type),
						type
					}
				}
			}
		}
	}
	if (Node.isThrowStatement(node)) {
		const callExpression = node.getFirstChildByKind(SyntaxKind.CallExpression)
		if (callExpression && Node.isCallExpression(callExpression)) {
			const args = callExpression.getArguments()
			if (args.length >= 2 && Node.isNumericLiteral(args[0]) && Node.isStringLiteral(args[1])) {
				const statusCode = args[0].getText()
				const message = args[1].getText()

				return {
					status: statusCode,
					message,
					type: 'unknown'
				}
			}
		}
	}

	return null
}

const apiParams: Record<string, TypeNode> = {}

function extractRootDirTypes(declaration: FunctionDeclaration | VariableDeclaration) {
	if (framework === 'sveltekit') {
		const requestEventTypePath = path.resolve(
			workingDir,
			declaration
				.getSourceFile()
				.getFilePath()
				.replace(workingDir, '.svelte-kit/types')
				.replace('/+server.ts', '/$types.d.ts')
		)

		if (!fs.existsSync(requestEventTypePath)) {
			log.warn(
				3,
				`No $types.d.ts found, Make sure you "npm run dev" at least once, or route params will not be typed`
			)
			return
		}

		log.info(3, `[SVELTEKIT]: Looking for $types.d.ts`)

		if (!requestEventTypePath) {
			log.error(
				3,
				`No generated $types.d.ts found, make sure you run 'npm run dev' once at least...`
			)
			return
		}

		const routeParamsType = project
			.addSourceFileAtPath(requestEventTypePath)
			?.getTypeAlias('RouteParams')

		if (!routeParamsType) {
			log.error(
				3,
				`No RequestEvent found in types.d.ts, make sure you run 'npm run dev' once at least...`
			)
			return
		}

		const routeParamTypeNode = routeParamsType.getTypeNode()
		if (routeParamTypeNode) {
			apiParams[declaration.getSourceFile().getFilePath()] = routeParamTypeNode
		}

		return declaration
	}
}

function tryParseJsDocComment(comment: string) {
	try {
		return commentParser.parse(comment)
	} catch (e) {
		log.error(3, `Failed to parse comment: ${comment}`)
		return null
	}
}

function processFunctionDeclaration(declaration: FunctionDeclaration | VariableDeclaration) {
	const file = declaration.getSourceFile()
	// Add the original logic for handling FunctionDeclaration here
	// based on your previous code.
	const methodType = declaration.getName()
	if (!methodType) {
		return
	}

	const filePath = declaration.getSourceFile().getFilePath()

	const apiPath = filePath
		.slice(filePath.indexOf('api/') + 4, filePath.lastIndexOf('/'))
		.replace(/\[\w+\]/g, ':$&')
		.replace(/\[|\]/g, '')

	if (!endpoints[apiPath]) {
		endpoints[apiPath] = {}
	}

	if (!endpoints[apiPath][methodType]) {
		telemetryPayload.data.processed_endpoints[methodType]++
		endpoints[apiPath][methodType] = {}
	}

	log.header(2, `${methodType}`)

	let resultsDeclaration: TypeReferenceNode | undefined

	const allDeclarations =
		declaration instanceof FunctionDeclaration
			? declaration.getDescendants()
			: declaration.getInitializer()?.getDescendants()

	if (allDeclarations !== undefined && allDeclarations.length === 0) {
		log.error(3, `No declarations found`)
	} else if (allDeclarations !== undefined) {
		// import the hidden import('./$types.js').RequestEvent type
		if (framework === 'sveltekit') {
			extractRootDirTypes(declaration)
		}

		const payloadDeclaration = allDeclarations.find((node: Node) => {
			if (Node.isVariableDeclaration(node)) {
				const name = node.getName()
				if (name === 'payload') {
					log.success(3, `Detected payload declaration`)
					return true
				}
			}
			return false
		}) as TypeReferenceNode | unknown

		let status = 200

		let addedResponses = new Set()

		if (!endpoints[apiPath][methodType]['responses']) {
			endpoints[apiPath][methodType]['responses'] = {}
		}

		if (!endpoints[apiPath][methodType]['docs']) {
			endpoints[apiPath][methodType]['docs'] = {}
		}

		const jsdoc = declaration
			.getDescendantStatements()
			.flatMap((statement) => statement.getLeadingCommentRanges())
			.map((range) => range.getText())
			.map((comment) => tryParseJsDocComment(comment))
			.filter((jsdoc) => {
				if (jsdoc && jsdoc.length > 0 && jsdoc.at(0)) {
					return jsdoc[0].tags.find((tag) => tag.tag === 'svetch')
				}
			})
		if (jsdoc.length > 0) {
			const doc = jsdoc[0]
			if (doc && doc[0]) {
				endpoints[apiPath][methodType]['docs'] = commentParser.stringify(doc[0])
			}
		}

		allDeclarations.forEach((node: Node) => {
			if (Node.isReturnStatement(node)) {
				const expression = node.getExpression()

				if (!expression) {
					log.error(3, `Detected return statement without expression`)
					return
				}

				if (!node.getText().includes('json') && !node.getText().includes('Response')) {
					log.error(
						3,
						`Detected return statement (${expression.getText()}) without json() or new Response() constructor, Skipping...`
					)
					return
				}
				// if it's a return statement with an expression, skip it

				if ((expression && Node.isCallExpression(expression)) || Node.isNewExpression(expression)) {
					;({ status, resultsDeclaration } = processReturnExpression(
						expression,
						status,
						resultsDeclaration
					))
				} else if (expression && Node.isIdentifier(expression)) {
					resultsDeclaration = processReturnIdentifier(expression, resultsDeclaration)
				} else {
					log.warn(
						3,
						`Unhandled return statement with type (${expression.getKindName()}), in ${node
							.getSourceFile()
							.getFilePath()}\n		please report this to the developer\n	------\n		${node.getText()}\n		------\n`
					)
				}
			} else if (Node.isVariableDeclaration(node) && node.getName() === 'results') {
				resultsDeclaration = processReturnVariable(resultsDeclaration, node)
			}

			if (!endpoints[apiPath][methodType]['responses'][status]) {
				endpoints[apiPath][methodType]['responses'][status] = []
			}

			if (resultsDeclaration) {
				const processedResponse = processTypeNode(resultsDeclaration)
				if (!addedResponses.has(JSON.stringify(processedResponse))) {
					endpoints[apiPath][methodType]['responses'][status].push(processedResponse)
					addedResponses.add(JSON.stringify(processedResponse))
				}
			}

			const throwDetails = extractCatchThrowDetails(node)

			if (throwDetails) {
				if (!endpoints[apiPath][methodType]['errors']) {
					endpoints[apiPath][methodType]['errors'] = {}
				}
				if (!endpoints[apiPath][methodType]['errors'][throwDetails.status]) {
					endpoints[apiPath][methodType]['errors'][throwDetails.status] = []
				}
				endpoints[apiPath][methodType]['errors'][throwDetails.status].push({
					message: throwDetails.message
				})
			}
		})

		if (!resultsDeclaration) {
			log.warn(2, `No results declaration found for ${methodType} method in ${file.getFilePath()}`)
		}

		if (['POST', 'PUT', 'PATCH'].includes(methodType) && !payloadDeclaration) {
			log.warn(2, `No payload declaration found for ${methodType} method in ${file.getFilePath()}`)
		}

		let pathParam = extractPathParams(apiPath)
		let queryParams = extractQueryParameters(declaration)
		let queryOrBodyParam = payloadDeclaration ? processTypeNode(payloadDeclaration) : 'never'

		if (methodType === 'GET' || methodType === 'DELETE') {
			endpoints[apiPath][methodType]['parameters'] = {
				path: pathParam,
				query: queryParams
			}
		} else {
			// for 'PUT', 'POST', and 'PATCH', always assign `query` to `undefined`
			endpoints[apiPath][methodType]['parameters'] = {
				path: pathParam,
				body: queryOrBodyParam,
				query: queryParams
			}
		}

		// warnIfResultsNotUsedInResponse(declaration)

		// log.debug(3, `responses`, endpoints[apiPath][methodType]['responses'])
	}
}

function processReturnVariable(
	resultsDeclaration: TypeReferenceNode | undefined,
	node: VariableDeclaration
) {
	resultsDeclaration = node.getTypeNode() as TypeReferenceNode
	if (!resultsDeclaration) {
		const initializer = node.getInitializer()
		if (initializer) {
			let expression = initializer

			// if the initializer is an await expression, get its expression
			if (Node.isAwaitExpression(initializer)) {
				expression = initializer.getExpression()
			}

			if (Node.isCallExpression(expression)) {
				// get the function
				const functionExpression = expression.getExpression()
				// log it
				log.debug(4, `function`, functionExpression.getText())
				// log the return type
				log.debug(4, `return type`, functionExpression.getType().getText())
				// get the type of the initializer
				const type = expression.getReturnType()
				// print the type
				log.debug(4, `return type`, type.getText())
			}
		}
	}
	return resultsDeclaration
}

function processReturnIdentifier(
	expression: Identifier,
	resultsDeclaration: TypeReferenceNode | undefined
) {
	log.success(
		3,
		`Detected return statement with identifier expression:\n		---\n		${expression?.getText()}\n		---\n`
	)
	const symbol = typeChecker.getSymbolAtLocation(expression)
	if (symbol) {
		const declarations = symbol.getDeclarations()
		if (declarations) {
			resultsDeclaration = declarations[0] as TypeReferenceNode
		}
	}
	return resultsDeclaration
}

function processFailExpression(
	expression: CallExpression,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined
) {
	// process fail(401, {...body}), first argument is the status code, second is the body
	const args = expression.getArguments()
	if (args.length > 0) {
		const arg = args.find((arg) => arg.getKind() == SyntaxKind.NumericLiteral)
		if (arg) {
			status = parseInt(arg.getText())
		}
	}
	if (args.length > 1) {
		const arg = args.find((arg) => arg.getKind() == SyntaxKind.ObjectLiteralExpression)
		if (arg) {
			const properties = arg.getProperties()
			if (properties.length > 0) {
				const property = properties[0]
				const initializer = property.getInitializer()
				if (initializer) {
					resultsDeclaration = initializer as TypeReferenceNode
				}
			}
		}
	}
	return { status, resultsDeclaration }
}

function processReturnExpression(
	expression: CallExpression,
	status: number,
	resultsDeclaration: TypeReferenceNode | undefined
) {
	log.success(3, `Detected return statement with expression:\n		---\n		${expression?.getText()}\n		---\n`)
	const args = expression.getArguments()
	// get the second argument, which is the Response init object, then get the status property
	if (args.length > 1) {
		const arg = args.find((arg) => arg.getKind() == SyntaxKind.ObjectLiteralExpression)
		if (arg) {
			log.warn(
				4,
				`Args: ${arg
					.getChildren()
					.map((arg) => arg.getText())
					.join(', ')}`
			)
			const statusProp = arg
				.getProperties()
				.find(
					(child) =>
						child.getKind() == SyntaxKind.PropertyAssignment && child.getText().includes('status')
				)

			if (statusProp) {
				const statusPropValue = statusProp
					.getChildren()
					.find((child) => child.getKind() == SyntaxKind.NumericLiteral)
				if (statusPropValue) {
					status = parseInt(statusPropValue.getText())
				}
			}
		}
	}

	if (args.length > 0) {
		const arg = args[0]
		if (arg.getKind() == SyntaxKind.Identifier) {
			const symbol = typeChecker.getSymbolAtLocation(arg)
			if (symbol) {
				const declarations = symbol.getDeclarations()
				if (declarations) {
					resultsDeclaration = declarations[0] as TypeReferenceNode
					if (declarations[0].getFirstDescendantByKind(SyntaxKind.MethodDeclaration)) {
						log.error(
							3,
							`Found method declaration, These are unsupported at the moment, but you can report it in github, ${declarations[0].getText()}`
						)
						// process.exit()
						// set as unknown type
						return {
							status,
							resultsDeclaration: undefined
						}
					}
					log.success(
						4,
						`Found (results = ) declaration:`,
						resultsDeclaration.getText().slice(0, 20)
					)
				}
			}
		} else if (arg.getKind() == SyntaxKind.ObjectLiteralExpression) {
			log.success(4, `Found Object results declaration:`, arg.getText())
			resultsDeclaration = arg as TypeReferenceNode
		} else {
			if (arg.getFirstDescendantByKind(SyntaxKind.MethodDeclaration)) {
				log.error(
					3,
					`Found method declaration, These are unsupported at the moment, but you can report it in github, ${arg.getText()}`
				)
				return {
					status,
					resultsDeclaration: undefined
				}
			}
			resultsDeclaration = arg as TypeReferenceNode
			log.warn(
				4,
				`Unhandled return statement, please report this to the developer, ${arg.getText()}, of type ${arg.getKindName()}`
			)
		}
	}
	return { status, resultsDeclaration }
}

function processTypeDeclaration(declaration: TypeAliasDeclaration) {
	const file = declaration.getSourceFile()
	// Add the original logic for handling TypeAliasDeclaration here
	// based on your previous code.
	const filePath = declaration.getSourceFile().getFilePath()
	const apiPath = filePath
		.slice(filePath.indexOf('api/') + 4, filePath.lastIndexOf('/'))
		.replace(/\[\w+\]/g, ':$&')
		.replace(/\[|\]/g, '')

	if (!endpoints[apiPath]) {
		endpoints[apiPath] = {}
	}

	const typeNode = declaration.getTypeNodeOrThrow()

	const methodType = declaration.getName().replace('_', '').toUpperCase()

	if (!endpoints[apiPath][methodType]) {
		endpoints[apiPath][methodType] = {}
	}

	const typeArguments = (typeNode as TypeReferenceNode).getTypeArguments()

	let pathParam = processTypeNode(typeArguments[0])
	let queryOrBodyParam = processTypeNode(typeArguments[1])

	if (methodType === 'GET' || methodType === 'DELETE') {
		endpoints[apiPath][methodType]['parameters'] = {
			path: pathParam,
			query: queryOrBodyParam
		}
	} else {
		// for 'PUT', 'POST', and 'PATCH', always assign `query` to `undefined`
		endpoints[apiPath][methodType]['parameters'] = {
			path: pathParam,
			body: queryOrBodyParam,
			query: undefined
		}
	}

	if (!endpoints[apiPath][methodType]['responses']) {
		endpoints[apiPath][methodType]['responses'] = {}
	}

	const processedTypeNode = processTypeNode(typeArguments[typeArguments.length - 1])

	endpoints[apiPath][methodType]['responses'][200] = processedTypeNode

	// collect all imported types
	file.getImportDeclarations().forEach((importDeclaration: ImportDeclaration) => {
		importDeclaration.getNamedImports().forEach((namedImport) => {
			importMap[namedImport.getName()] = importDeclaration.getModuleSpecifierValue()
		})
	})
}

function processActionsDeclaration(declaration: TypeAliasDeclaration) {
	const file = declaration.getSourceFile()
	// Add the original logic for handling TypeAliasDeclaration here
	// based on your previous code.
	const filePath = declaration.getSourceFile().getFilePath()
	const apiPath = filePath
		.slice(filePath.indexOf('api/') + 4, filePath.lastIndexOf('/'))
		.replace(/\[\w+\]/g, ':$&')
		.replace(/\[|\]/g, '')

	if (!actions[apiPath]) {
		actions[apiPath] = {}
	}

	const typeNode = declaration.getTypeNodeOrThrow()

	const methodType = 'ACTION'

	if (!actions[apiPath][methodType]) {
		actions[apiPath][methodType] = {}
	}

	const objectLiteral = declaration.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression)

	if (!objectLiteral) {
		log.warn(2, `No object literal found for ${apiPath}`)
		return
	}

	// process each action inside the declaration

	objectLiteral.forEachDescendant((node) => {
		if (node.getKind() === SyntaxKind.PropertyAssignment) {
			const actionName = node.getSymbol()?.getName()!
			const payloadStatement = node
				.getFirstDescendantByKind(SyntaxKind.ArrowFunction)
				?.getFirstDescendantByKind(SyntaxKind.Block)
				?.getFirstDescendantByKind(SyntaxKind.SyntaxList)
				?.getChildrenOfKind(SyntaxKind.VariableStatement)
				.find((child: VariableStatement) => {
					const name = child.getFirstDescendantByKind(SyntaxKind.Identifier)?.getText()
					if (name === 'payload') {
						log.success(3, `Detected payload declaration`)
						return true
					}

					return false
				})
				?.getFirstDescendantByKind(SyntaxKind.Identifier)

			if (!payloadStatement) {
				log.warn(2, `No payload declaration found for ${apiPath}.${actionName}`)
				return
			}

			const payloadType = typeChecker.getTypeAtLocation(payloadStatement).getText()

			if (!actions[apiPath][methodType][actionName]) {
				actions[apiPath][methodType][actionName] = {
					parameters: {
						path: {},
						query: {},
						body: {}
					},
					responses: {},
					errors: {}
				}
			}
			actions[apiPath][methodType][actionName]['parameters']['body'] = payloadType

			let status = 200

			let resultsDeclaration: TypeReferenceNode | undefined

			let addedResponses = new Set()

			node.getDescendants().forEach((node: Node) => {
				if (Node.isReturnStatement(node)) {
					const expression = node.getExpression()

					if (!expression) {
						log.error(3, `Detected return statement without expression`)
						return
					}

					if (node.getText().includes('fail')) {
						log.error(3, `Detected return statement with fail`)
						;({ status, resultsDeclaration } = processFailExpression(
							expression,
							status,
							resultsDeclaration
						))
						if (resultsDeclaration) {
							const processedResponse = processTypeNode(resultsDeclaration)
							if (!actions[apiPath][methodType][actionName]['errors']) {
								actions[apiPath][methodType][actionName]['errors'] = {}
							}
							if (!actions[apiPath][methodType][actionName]['errors'][status]) {
								actions[apiPath][methodType][actionName]['errors'][status] = []
							}
							actions[apiPath][methodType][actionName]['errors'][status].push({
								message: processedResponse
							})
							addedResponses.add(JSON.stringify(processedResponse))
						}
						return
					}
					// if it's a return statement with an expression, skip it

					if (
						(expression && Node.isCallExpression(expression)) ||
						Node.isNewExpression(expression)
					) {
						;({ status, resultsDeclaration } = processReturnExpression(
							expression,
							status,
							resultsDeclaration
						))
					} else if (expression && Node.isIdentifier(expression)) {
						resultsDeclaration = processReturnIdentifier(expression, resultsDeclaration)
					} else if (expression && Node.isObjectLiteralExpression(expression)) {
						resultsDeclaration = expression
					} else {
						log.warn(
							3,
							`Unhandled return statement with type (${expression.getKindName()}), in ${node
								.getSourceFile()
								.getFilePath()}\n		please report this to the developer\n	------\n		${node.getText()}\n		------\n`
						)
					}
				} else if (Node.isVariableDeclaration(node) && node.getName() === 'results') {
					resultsDeclaration = processReturnVariable(resultsDeclaration, node)
				}

				if (!actions[apiPath][methodType][actionName]['responses'][status]) {
					actions[apiPath][methodType][actionName]['responses'][status] = []
				}

				if (resultsDeclaration) {
					const processedResponse = processTypeNode(resultsDeclaration)
					if (!addedResponses.has(JSON.stringify(processedResponse))) {
						actions[apiPath][methodType][actionName]['responses'][status].push(processedResponse)
						addedResponses.add(JSON.stringify(processedResponse))
					}
				}
			})
		}
	})
}

let processedFiles = new Set()

function processFiles() {
	function validDeclaration(declaration: ExportedDeclarations, validTypes: string[]) {
		if (
			declaration instanceof FunctionDeclaration ||
			declaration instanceof VariableDeclaration ||
			declaration instanceof TypeAliasDeclaration
		) {
			const declarationName = declaration.getName()
			return declarationName && validTypes.includes(declarationName)
		}
		return false
	}

	const handleProcessing = (
		file: SourceFile,
		declaration: FunctionDeclaration | VariableDeclaration | TypeAliasDeclaration,
		processFunction: any
	) => {
		if (!processedFiles.has(file.getFilePath())) {
			log.header(1, `⌘  Processing: ${file.getFilePath().replace(workingDir, '')}`)
			processedFiles.add(file.getFilePath())
		}
		processFunction(declaration)
	}

	project.getSourceFiles().forEach((file) => {
		telemetryPayload.data.processed_files_count += 1
		file.getExportedDeclarations().forEach((declarationsArray) => {
			declarationsArray.forEach((declaration) => {
				if (validDeclaration(declaration, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) {
					handleProcessing(file, declaration, processFunctionDeclaration)
				} else if (
					validDeclaration(declaration, ['_Get', '_Post', '_Put', '_Patch', '_Delete']) &&
					declaration instanceof TypeAliasDeclaration
				) {
					handleProcessing(file, declaration, processTypeDeclaration)
				} else if (validDeclaration(declaration, ['actions'])) {
					return
					handleProcessing(file, declaration, processActionsDeclaration)
				}
			})
		})
	})
}

let output = ''
let actionOutput = ''

function formatObject(obj) {
	if (Array.isArray(obj)) {
		return obj.map(formatObject).join(' | ')
	} else if (typeof obj === 'string') {
		if (/^\{\s*\}$/.test(obj)) {
			return 'never'
		}
		return obj
	} else if (obj == null || JSON.stringify(obj) === JSON.stringify({})) {
		return 'never'
	}

	let objStr = '{\n'
	for (const key in obj) {
		let value = formatObject(obj[key])
		objStr += `          ${key}: ${value},\n`
	}
	objStr += '        }'
	return objStr
}

function generateOutput() {
	for (const apiPath in endpoints) {
		output += `  '${apiPath}': {\n`
		for (const method in endpoints[apiPath]) {
			const docs = endpoints[apiPath][method]['docs']
			if (docs.length > 0) {
				output += `   ${docs}`
			}

			output += `    ${method}: {\n`
			output += `      parameters: {\n`

			const parameters = endpoints[apiPath][method]['parameters']
			for (const paramType in parameters) {
				let paramValue = formatObject(parameters[paramType])
				let optional = paramValue === 'never' ? '?' : ''
				output += `        ${paramType}${optional}: ${paramValue},\n`
			}
			output += `      },\n`
			output += `      responses: {\n`

			for (const statusCode in endpoints[apiPath][method]['responses']) {
				let response = endpoints[apiPath][method]['responses'][statusCode]
				const formattedResponse = formatObject(response)
				if (formattedResponse.trim() === '') {
					continue
				}
				output += `        ${statusCode}: ${formatObject(response)},\n`
			}

			output += `      }\n`
			if (endpoints[apiPath][method]['errors']) {
				output += `      errors: {\n`

				for (const statusCode in endpoints[apiPath][method]['errors']) {
					let response = endpoints[apiPath][method]['errors'][statusCode]
					output += `        ${statusCode}: ${formatObject(response)},\n`
				}

				output += `      }\n`
			}
			output += `    },\n`
		}
		output += '  },\n'
	}

	output = 'export interface APIPaths {\n' + output + '};\n'
}

function generateActionsOutput() {

	for (const apiPath in actions) {
		actionOutput += `  '${apiPath}': {\n`
		for (const method in actions[apiPath]) {
			// const docs = actions[apiPath][method]["docs"];
			// if (docs.length > 0) {
			//   console.log("docs", docs);
			//   actionOutput += `   ${docs}`;
			// }

			actionOutput += `    ${method}: {\n`

			for (const action in actions[apiPath][method]) {
				actionOutput += `      parameters: {\n`

				const parameters = actions[apiPath][method][action]['parameters']
				for (const paramType in parameters) {
					let paramValue = formatObject(parameters[paramType])
					let optional = paramValue === 'never' ? '?' : ''
					actionOutput += `        ${paramType}${optional}: ${paramValue},\n`
				}
				actionOutput += `      },\n`
				actionOutput += `      responses: {\n`

				for (const statusCode in actions[apiPath][method][action]['responses']) {
					let response = actions[apiPath][method][action]['responses'][statusCode]
					const formattedResponse = formatObject(response)
					if (formattedResponse.trim() === '') {
						continue
					}
					actionOutput += `        ${statusCode}: ${formatObject(response)},\n`
				}

				actionOutput += `      }\n`
				actionOutput += `      errors: {\n`

				for (const statusCode in actions[apiPath][method][action]['errors']) {
					let response = actions[apiPath][method][action]['errors'][statusCode]
					actionOutput += `        ${statusCode}: ${formatObject(response)},\n`
				}

				actionOutput += `      }\n`
				actionOutput += `    },\n`
			}
		}
		actionOutput += '  },\n'
	}

	actionOutput = 'export interface ActionPaths {\n' + actionOutput + '};\n'
}

function generateInterfaces() {
	const interfaces = fs.readFileSync(path.resolve(__dirname, './utils/interfaces.ts')).toString()
	output = interfaces + '\n' + output

	// add the import statements at the top
	let importsOutput = ''
	for (const [importName, moduleName] of Object.entries(importMap)) {
		if (
			moduleName !== './$types' &&
			!['Post', 'Get', 'Put', 'Patch', 'Delete'].includes(importName)
		) {
			importsOutput += `import { ${importName} } from "${moduleName}";\n`
		}
	}

	const final_output = importsOutput + output + actionOutput

	// count how many lines are in the output
	telemetryPayload.data.generated_lines_of_code += final_output.split('\n').length

	fs.writeFileSync(path.join(outputPath, 'api.ts'), final_output)

	log.success(2, `generated Svetch API types in ${path.join(outputPath, 'api.ts')}`)
}

function generateClient() {
	const interfaces = fs.readFileSync(path.resolve(__dirname, './utils/client.ts')).toString()
	output = interfaces + '\n' + output

	// add the import statements at the top
	let importsOutput = ''
	for (const [importName, moduleName] of Object.entries(importMap)) {
		if (
			moduleName !== './$types' &&
			!['Post', 'Get', 'Put', 'Patch', 'Delete'].includes(importName)
		) {
			importsOutput += `import { ${importName} } from "${moduleName}";\n`
		}
	}

	const final_output = importsOutput + output

	telemetryPayload.data.generated_lines_of_code += final_output.split('\n').length

	fs.writeFileSync(path.join(outputPath, 'client.ts'), final_output)

	log.success(2, `Genererated Svetch Client in ${path.join(outputPath, 'client.ts')}`)
}

let jsonSchema: TJS.Definition | null = null

async function sendTelemetry() {
	if (telemetry === false) {
		return
	}

	// read previous telemetry if it exists
	if (fs.existsSync(path.join(__dirname, 'telemetry.json'))) {
		const previousTelemetry = JSON.parse(
			fs.readFileSync(path.join(__dirname, 'telemetry.json')).toString()
		)

		// if the previous telemetry was sent less than 24 hours ago, don't send it again
		if (Date.now() - previousTelemetry.timestamp < 1000 * 60 * 60 * 24) {
			return
		}

		// if the number of lines of code is the same as the previous telemetry, don't send it again
		if (
			previousTelemetry.data.generated_lines_of_code ===
			telemetryPayload.data.generated_lines_of_code
		) {
			return
		}
	}

	// write telemetry locally
	fs.writeFileSync(path.join(__dirname, 'telemetry.json'), JSON.stringify(telemetryPayload))

	// send telemetry to svetch server
	const url = 'https://svetch-dev.vercel.app/telemetry'

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(telemetryPayload)
	})

	if (response.status === 200) {
		log.debug(
			1,
			`Telemetry sent successfully, it contains only statistics, if you don't want it, you can set telemetry to false in your .svetchrc file`
		)
	}
}

function generateSchema() {
	// optionally pass argument to schema generator
	const settings: TJS.PartialArgs = {
		// required: true,
		ignoreErrors: true
		// topRef: true,
	}

	// optionally pass ts compiler options
	// const compilerOptions: TJS.CompilerOptions = {
	// strictNullChecks: true,
	// };

	// optionally pass a base path
	// const basePath = "./my-dir";

	const program = TJS.getProgramFromFiles(
		[resolve(`${out}/api.ts`)]
		// compilerOptions,
		// basePath
	)

	// We can either get the schema for one file and one type...
	const schema = TJS.generateSchema(program, 'APIPaths', settings)

	jsonSchema = schema

	// ensure schema path is there
	if (!fs.existsSync(schemaOutputPath)) {
		fs.mkdirSync(schemaOutputPath)
	}

	fs.writeFileSync(path.join(outputPath, 'schema.json'), JSON.stringify(schema, null, 2))

	fs.writeFileSync(path.join(schemaOutputPath, 'apiSchema.json'), JSON.stringify(schema))

	telemetryPayload.data.generated_lines_of_code += JSON.stringify(schema).split('\n').length
}

async function generateZodSchema() {
	const schema = parseSchema(jsonSchema as any)

	const output = `import { z } from 'zod';\n\nexport const schema = ${schema};`

	telemetryPayload.data.generated_lines_of_code += output.split('\n').length

	//   write
	fs.writeFileSync(path.join(outputPath, 'zod.ts'), output)
	log.success(2, `Generated zod schema in ${path.join(outputPath, 'zod.ts')}`)
}

function generateSvetchClient() {
	let client = fs.readFileSync(path.resolve(__dirname, './utils/client.ts')).toString()

	// if the schema was generated, add it to the client
	if (fs.existsSync(path.join(outputPath, 'zod.ts'))) {
		client = `import { schema } from './zod'` + '\n' + client
	}

	if (fs.existsSync(path.join(outputPath, 'schema.json'))) {
		client = `import type { APIPaths } from './api'` + '\n' + client
	}

	// write
	fs.writeFileSync(path.join(outputPath, 'client.ts'), client)
	log.success(2, `Generated client in ${path.join(outputPath, 'client.ts')}`)
}

function generateSvetchDocs() {
	const docs = fs
		.readFileSync(path.resolve(__dirname, './static/docs/+page.svelte'))
		.toString()
		.replace('[CLIENT_PATH]', path.join(workingDir, out, 'client').replace(workingDir, '').slice(1))
	// get all components inside the static/docs/components folder
	const body_block = fs
		.readFileSync(path.resolve(__dirname, './static/docs/components/BodyBlock.svelte'))
		.toString()
		.replace('[INTERFACE_PATH]', path.join(workingDir, out, 'api').replace(workingDir, '').slice(1))
	const Collapsible = fs
		.readFileSync(path.resolve(__dirname, './static/docs/components/Collapsible.svelte'))
		.toString()

	// get all components inside the static/docs/components folder
	// create the folders
	if (!fs.existsSync(docsOutputPath)) {
		fs.mkdirSync(docsOutputPath, { recursive: true })
	}
	if (!fs.existsSync(path.join(docsOutputPath, 'components'))) {
		fs.mkdirSync(path.join(docsOutputPath, 'components'), { recursive: true })
	}

	// write
	fs.writeFileSync(path.join(docsOutputPath, '+page.svelte'), docs)
	fs.writeFileSync(path.join(docsOutputPath, 'components/BodyBlock.svelte'), body_block)
	fs.writeFileSync(path.join(docsOutputPath, 'components/Collapsible.svelte'), Collapsible)
	log.success(2, `Generated docs in ${docsOutputPath}`)
}

function main() {
	// check if input folder exists

	if (!fs.existsSync(input)) {
		log.error(1, `Input folder ${input} does not exist`)
		log.warn(
			1,
			`Please change it in your .svetchrc file here: 👉 [${path.resolve(
				workingDir,
				'.svetchrc'
			)}]\nOr run svetch init again.\n\nExiting...\n\n`
		)
		process.exit(1)
	}
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, { recursive: true })
	}
	log.info(1, `Generating API types in ${outputPath}`)
	processFiles()
	log.header(1, `Processed, Writing files...`)
	generateOutput()
	generateActionsOutput()
	generateInterfaces()
	generateClient()
	try {
		generateSchema()
		generateZodSchema()
		generateSvetchDocs()
	} catch (error) {
		log.error(1, `Error generating schema, please report this to the developer, ${error}`)
	}
	generateSvetchClient()

	try {
		sendTelemetry()
	} catch (error) {}

	log.success(1, `\n${separator}\nDone!, now import Svetch using the following code:\n\n`)
	log.info(
		1,
		`import { Svetch } from ${path
			.join(workingDir, out, 'client')
			.replace(workingDir, '')
			.slice(1)};`
	)
	log.info(1, `const svetch = new Svetch();\n\n`)

	// find how many files are in the project, that end in +server.ts
	const totalFiles = project.getSourceFiles().filter((file) => {
		return file.getFilePath().includes('+server.ts')
	}).length

	// if files more than 10, prompt user to purchase
	if (totalFiles > 10) {
		log.info(
			1,
			`
      \x1b[33m⚠ Wow! You have ${totalFiles} endpoints in your project. You're certainly getting the most out of Svetch!\n
      By now, you must have realized the value Svetch brings to your development process - the time it saves, the consistency it provides, and the boilerplate it cuts out. It's become a crucial part of your toolkit.

      \x1b[37mSvetch is a labor of love, maintained and continually improved to help developers like you create amazing things with less effort. But we need your support to keep it growing and evolving.
      By purchasing a license, you contribute to the future development and maintenance of Svetch.

      Plus, with a full license, you can use Svetch with no restrictions, no matter how big your projects get! 
    `
		)
		log.header(
			1,
			`
      👉 Support the development and get your license here: [https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d]
      
      Thank you for using Svetch and for your support!
      `
		)
		// the library will still work
	}
}

export function runAll() {
	if (isInit || !fs.existsSync(path.resolve(workingDir, '.svetchrc'))) {
		initSvetchrc().then(() => {
			checkVersion()
			main()
		})
	} else {
		checkVersion()
		main()
	}
}

import { exec } from 'child_process'
import { Telemetry } from './types/telemetry'
const packageJson = require(path.resolve(__dirname, '../package.json'))

function checkVersion() {
	const packageName = packageJson.name
	const currentVersion = packageJson.version
	exec(`npm show ${packageName} version`, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`)
			return
		}

		const latestVersion = stdout.trim()

		telemetryPayload.data.script_version = currentVersion

		console.log(`Current version: ${currentVersion}`)
		console.log(`Latest version: ${latestVersion}`)

		if (currentVersion !== latestVersion) {
			console.log(`A newer version of ${packageName} is available.`)
		} else {
			console.log(`You are using the latest version of ${packageName}.`)
		}
	})
}

// runAll()
