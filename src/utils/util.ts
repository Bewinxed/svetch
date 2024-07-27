import _ from "lodash";
import { resolve, join } from "node:path";
import * as tsm from "ts-morph";
// import aliases from "../aliases";

export type Diagnostic = {
	external: Set<string>;
	importFileNotFound: Set<string>;
	nodeModules: Set<string>;
	externalDeclarations: Set<string>;
	notFound: Set<string>;
	nameClash: Set<string>;
	failedToPrint: Set<string>;
};

export const fn = (filename: string) => resolve(process.cwd(), filename);

const _declarationFileCache = new Map<string, tsm.SourceFile>();

export const emitFileDeclaration = (
	project: tsm.Project,
	sourceFile: tsm.SourceFile,
	outProject = new tsm.Project({
		skipAddingFilesFromTsConfig: true,
		compilerOptions: {
			...project.getCompilerOptions(),
			declaration: true,
			emitDeclarationOnly: true,
			declarationDir: "/outdir",
			allowJs: true,
			target: tsm.ScriptTarget.ESNext,
			module: tsm.ModuleKind.ESNext,
			jsx: tsm.ts.JsxEmit.React,
		},
		useInMemoryFileSystem: true,
	}),
) => {
	if (_declarationFileCache.has(sourceFile.getFilePath())) {
		return _declarationFileCache.get(sourceFile.getFilePath())!;
	}

	const memResult = project.emitToMemory({
		emitOnlyDtsFiles: true,
		targetSourceFile: sourceFile,
	});

	for (const memDefFiles of memResult.getFiles()) {
		if (memDefFiles.filePath.endsWith(".d.ts")) {
			const file = outProject.createSourceFile(
				memDefFiles.filePath.replace(process.cwd().replace(/\\/g, "/"), ""),
				memDefFiles.text,
				{ overwrite: true },
			);
			_declarationFileCache.set(sourceFile.getFilePath(), file);
			return file;
		}
	}
};

export const isDeclaration = (node: tsm.Node) => {
	return (
		tsm.Node.isClassDeclaration(node) ||
		tsm.Node.isInterfaceDeclaration(node) ||
		tsm.Node.isTypeAliasDeclaration(node) ||
		tsm.Node.isVariableStatement(node) ||
		tsm.Node.isVariableDeclaration(node) ||
		tsm.Node.isFunctionDeclaration(node) ||
		tsm.Node.isEnumDeclaration(node)
	);
};

type NamedType =
	| tsm.ClassDeclaration
	| tsm.InterfaceDeclaration
	| tsm.TypeAliasDeclaration
	| tsm.VariableStatement
	| tsm.VariableDeclaration
	| tsm.FunctionDeclaration
	| tsm.EnumDeclaration
	| tsm.ImportTypeNode
	| tsm.TypeReferenceNode
	| tsm.HeritageClause
	| tsm.ComputedPropertyName
	| tsm.TypeQueryNode;

export function hasOwnIdentifier(node: tsm.Node): node is NamedType {
	return (
		tsm.Node.isClassDeclaration(node) ||
		tsm.Node.isInterfaceDeclaration(node) ||
		tsm.Node.isTypeAliasDeclaration(node) ||
		tsm.Node.isVariableStatement(node) ||
		tsm.Node.isVariableDeclaration(node) ||
		tsm.Node.isFunctionDeclaration(node) ||
		tsm.Node.isEnumDeclaration(node) ||
		tsm.Node.isImportTypeNode(node) ||
		tsm.Node.isTypeReference(node) ||
		tsm.Node.isHeritageClause(node) ||
		tsm.Node.isComputedPropertyName(node) ||
		tsm.Node.isTypeQuery(node)
	);
}

function hasJsDocTag<T extends tsm.Node>(node: T, needle: string) {
	if (tsm.Node.isJSDocable(node)) {
		for (const _n of node.getJsDocs()) {
			if (_n.getInnerText().includes(needle)) {
				return true;
			}
		}
	}
	return false;
}

export const getExportableNode = (_node: tsm.Node) => {
	const node = tsm.Node.isVariableDeclaration(_node)
		? _node.getFirstAncestorByKind(tsm.SyntaxKind.VariableStatement)
		: _node;
	return tsm.Node.isExportable(node) ? node : undefined;
};

export function isExportable<T extends tsm.Node>(
	node: T,
): node is T & tsm.ExportableNode {
	return !!getExportableNode(node);
}

export const isJsDocChild = (node: tsm.Node) => {
	return node.getAncestors().some((ancestor) => tsm.Node.isJSDoc(ancestor));
};

const _nodeIdCache = new Map<tsm.Node, tsm.Node>();
export const getNodeId = (node: tsm.Node) => {
	if (_nodeIdCache.has(node)) {
		return _nodeIdCache.get(node)!;
	}
	for (const id of node.getDescendantsOfKind(tsm.SyntaxKind.Identifier)) {
		if (!isJsDocChild(id)) {
			_nodeIdCache.set(node, id);
			return id;
		}
	}
	return null;
};

function findChildrenOfKindById(needle: tsm.Node, haystack: tsm.Node) {
	const needleId = getNodeId(needle);
	if (needleId) {
		const kind = needle.getKind();
		const children = haystack.getChildrenOfKind(kind);
		for (const child of children) {
			const childId = getNodeId(child);
			if (childId && needleId.getText() === childId.getText()) {
				return child;
			}
		}
	}

	return null;
}

/**
 * Simplified node type index file resolution.
 */
const getFileFromModulePath = (project: tsm.Project, modulePath: string) => {
	let file = project.getSourceFile(`${modulePath}.ts`);
	if (!file) {
		file = project.getSourceFile(`${modulePath}.tsx`);
	}
	if (!file) {
		file = project.getSourceFile(`${modulePath}/index.ts`);
	}
	if (!file) {
		file = project.getSourceFile(`${modulePath}/index.tsx`);
	}
	return file;
};

const _forget = new Set<tsm.ImportTypeNode>();

export const replaceTransientImport = (
	{
		node,
		sourceFile,
		declarationFile,
	}: {
		node: tsm.ImportTypeNode;
		sourceFile: tsm.SourceFile;
		declarationFile: tsm.SourceFile;
	},
	inProject: tsm.Project,
	diagnostics: Diagnostic,
) => {
	const literal = node.getFirstDescendantByKind(tsm.SyntaxKind.StringLiteral)!;
	const file = resolveModule(
		literal.getLiteralValue(),
		sourceFile.getDirectoryPath(),
		inProject,
	);
	if (file) {
		// find the node with the id and add to work items
		const importedNode = findChildrenOfKindById(
			node,
			file,
			// [...file.getExportedDeclarations().values()].flat()
		);

		// strip the import type
		const nodeText = getNodeId(node)!.getText();
		node.replaceWithText(nodeText);

		// add a @transient tag to the imported node for additional clarity
		if (
			!hasJsDocTag(importedNode, "transient") &&
			tsm.Node.isJSDocable(importedNode)
		) {
			importedNode.addJsDoc({
				description: `@transient`,
			});
		}
		return importedNode;
	} else {
		//TODO if the transient import is external, eg zustand
		// we need to add the identifier to imports
		diagnostics.importFileNotFound.add(literal.getLiteralValue());
		return null;
	}
};

/**
 * Replace transient imports with regular imports.
 *
 * Transient imports are added by typescript like type A = import("a").A which we strip and add
 * as regular imports.
 *
 * @returns
 */
export const replaceTransientImports = (
	declarationFile: tsm.SourceFile,
	sourceFile: tsm.SourceFile,
	inProject: tsm.Project,
	diagnostics: Diagnostic,
) => {
	return [
		...new Set(
			declarationFile
				.getDescendantsOfKind(tsm.SyntaxKind.ImportType)
				.map((importType) => {
					return replaceTransientImport(
						{
							node: importType,
							sourceFile,
							declarationFile,
						},
						inProject,
						diagnostics,
					);
				})
				.filter((x) => x),
		),
	];
};

/**
 * Resolves module path based on cwd similar to node. Respects aliases.
 *
 * @param baseModulePath Module identifier to be imported
 * @param cwd File directory that is importing the module
 * @param project Project
 * @returns SourceFile | null
 */
export const resolveModule = (
	baseModulePath: string,
	cwd: string,
	project: tsm.Project,
) => {
	let file: tsm.SourceFile | undefined;

	const projectUrl = project.getCompilerOptions().baseUrl || "";
	const paths = project.getCompilerOptions().paths || {};

	const alias = Object.keys(paths).find((alias) =>
		baseModulePath.startsWith(alias.replace("*", "")),
	);

	if (alias) {
		for (const path of paths[alias]) {
			const modulePath = join(
				projectUrl,
				baseModulePath.replace(alias.replace("*", ""), path.replace("*", "")),
			);
			file = getFileFromModulePath(project, modulePath);
			if (file) {
				break;
			}
		}
	} else {
		file = getFileFromModulePath(project, resolve(cwd, baseModulePath));
	}

	if (file) {
		return file;
	}
	return null;
};

/**
 * Whether the node definition is external to the project
 */
export const isExternalNode = (node: tsm.Node) => {
	return (
		node.getSourceFile().isInNodeModules() ||
		node.getSourceFile().isFromExternalLibrary()
	);
};

/**
 * Gets the definition nodes for a given node identifier
 *
 * @param id The node identifier to get the definition nodes for
 * @param project
 * @param allowExternal
 * @returns
 */
export const getDefinitionNodes = (
	id: tsm.Identifier,
	project: tsm.Project,
	allowExternal = false,
) => {
	let definitionNodes = id.getDefinitionNodes().filter((def) => {
		if (allowExternal) return true;
		return (
			!def.getSourceFile().isInNodeModules() &&
			!def.getSourceFile().isFromExternalLibrary()
		);
	});

	// sometimes definition nodes are not found because they are external
	// othertimes they are not found for some reason and we need to get it from the symbol
	if (id.getDefinitionNodes().length === 0) {
		const definitions = id.getDefinitions();

		for (const definition of definitions) {
			const file = project.getSourceFile(
				definition.getSourceFile().getFilePath(),
			);
			if (file) {
				if (
					!allowExternal &&
					(file.isInNodeModules() || file.isFromExternalLibrary())
				) {
					continue;
				}
				file.forEachDescendant((child) => {
					//TODO: should get type + identifier
					if (
						getNodeId(child) &&
						getNodeId(child)!.getText() === id.getText()
					) {
						definitionNodes.push(child);
					}
				});
			}
		}
	}
	return definitionNodes;
};

export const isReferencedByAncestorDeclaration = (
	node: tsm.Node,
	srcDeclNode: tsm.Node,
) => {
	const id = getNodeId(node)!.getText();
	let _declParent = srcDeclNode;

	while (_declParent.getParent()) {
		_declParent = _declParent.getParent();
	}

	for (const _decl of _declParent.getDescendantsOfKind(node.getKind())) {
		for (const _id of _decl.getChildrenOfKind(tsm.SyntaxKind.Identifier)) {
			if (_id.getText() === id) {
				return true;
			}
		}
	}
	return false;
};

/**
 * For variable declaration node types we actually want the parent variable statement node type since that is exportable
 * All other nodes are returned as is
 */
export const getStatement = (node: tsm.Node) => {
	if (tsm.Node.isVariableDeclaration(node)) {
		return node.getFirstAncestorByKindOrThrow(tsm.SyntaxKind.VariableStatement);
	}

	return node;
};

type OutputNodeTextOptions = {
	wrapInGlobal?: string[];
	defaultInternal?: boolean;
};

export const outputNodeText = (
	declNode: tsm.Node,
	sourceFile: tsm.SourceFile,
	result: {
		global: string;
		content: string;
	},
	opts: OutputNodeTextOptions,
) => {
	const outputNode = getStatement(declNode);

	if (
		opts.wrapInGlobal &&
		opts.wrapInGlobal.includes(getNodeId(declNode)!.getText())
	) {
		if (
			(declNode as tsm.ClassDeclaration).isAmbient &&
			(declNode as tsm.ClassDeclaration).isAmbient()
		) {
			(declNode as tsm.ClassDeclaration).setHasDeclareKeyword(false);
		}
		if (isExportable(declNode)) {
			result.global +=
				`\n\n//${sourceFile.getFilePath()}\n` + outputNode.getFullText();
		} else {
			throw new Error("Cannot wrap in global if not exportable");
		}
	} else {
		if (tsm.Node.isJSDocable(outputNode) && tsm.Node.isExportable(outputNode)) {
			if (
				opts.defaultInternal &&
				!hasJsDocTag(outputNode, "public") &&
				!hasJsDocTag(outputNode, "internal")
			) {
				outputNode.addJsDoc("@internal");
			}

			if (hasJsDocTag(outputNode, "internal")) {
				outputNode.setIsExported(false);
			}
		}
		result.content +=
			`\n\n//${sourceFile.getFilePath()}\n` + outputNode.getFullText();
	}
};

/**
 * Gets the declaration node for a given definition node.
 * These are matched naively by kind and identifier name
 */
export const getDeclarationNode = (
	node: tsm.Node,
	inProject: tsm.Project,
	outProject: tsm.Project,
) => {
	if (hasOwnIdentifier(node)) {
		const nodeDecl = emitFileDeclaration(
			inProject,
			node.getSourceFile(),
			outProject,
		);

		return findChildrenOfKindById(node, nodeDecl);
	}
	return null;
};