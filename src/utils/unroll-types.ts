import * as tsm from "ts-morph";
import { ImportNodeUtil } from "./import-utils.js";
import {
	type Diagnostic,
	emitFileDeclaration,
	getDeclarationNode,
	getNodeId,
	isExportable,
	hasOwnIdentifier,
	isJsDocChild,
	replaceTransientImports,
	isDeclaration,
	getExportableNode,
	getDefinitionNodes,
	isReferencedByAncestorDeclaration,
	getStatement,
	outputNodeText,
	replaceTransientImport,
} from "./util.js";

/**
 *
 * @param inFiles A file list of entry files
 * @param tsConfigFilePath An optional config path for tsconfig.json
 * @param compilerOptions Optional compiler options for the TypeScript compiler
 * @param defaultInternal Whether to treat all exports as internal by default
 * @returns
 */
export const unrollTypes = async ({
	project,
	file,
	wrapInGlobal = [],
	globalExternals = [],
	defaultInternal = false,
	prefix = "",
}: {
	project: tsm.Project;
	file: string;
	tsConfigFilePath?: string;
	wrapInGlobal?: string[];
	globalExternals?: string[];
	defaultInternal?: boolean;
	prefix?: string;
}) => {
	let result = {
		content: "",
		global: "",
		prepend: "",
		diagnostics: {
			nodeModules: new Set<string>(),
			external: new Set<string>(),
			notFound: new Set<string>(),
			importFileNotFound: new Set<string>(),
			externalDeclarations: new Set<string>(),
			nameClash: new Set<string>(),
			failedToPrint: new Set<string>(),
		} as Diagnostic,
	};

	/** The source TS files */
	const inProject = project;

	/** Matching declaration files will be outputted and found here */
	const outProject = new tsm.Project({
		skipAddingFilesFromTsConfig: true,
		compilerOptions: {
			...inProject.getCompilerOptions(),
			declaration: true,
			emitDeclarationOnly: true,
			declarationDir: "/outdir",
		},
		useInMemoryFileSystem: true,
	});

	const _collectedNodeDefinitions: tsm.Node[] = [];
	const _collectedNodeDefinitionsListMap = new Map<string, tsm.Node[]>();
	const _printedNodeDeclarations = new Set<tsm.Node>();

	/**
	 * Any import statements that are not in the project will be added to this list
	 */
	const nodeModuleImports = new ImportNodeUtil();

	/**
	 * Any import statements that in the project for d.ts files will be added to this list
	 */
	const nodeModuleDeclarationImports = new ImportNodeUtil();

	// note: processed, not necessarily collected
	const _alreadyTriedToCollectNode = new Set<tsm.Node>();

	const _transients = new Set<{
		node: tsm.ImportTypeNode;
		sourceFile: tsm.SourceFile;
		declarationFile: tsm.SourceFile;
	}>();

	/**
	 * Recursively "collects" all definitions that are local to the project based off identifiers found in the source code (node).
	 *
	 * Goes through the source file and:
	 * 1. Iterates all node definitions of identifiers
	 * 2. If a definition node is external or in node modules simply add it to the diagnostics and skip it
	 * 3. If a definition node is in a declaration file, add it to nodeModuleDeclarationImports and diagnostics and skip it
	 * 4. If a definition node has already been processed, skip it
	 * 3. If a definition node is in the project, recursively call collect on it
	 *
	 * After the identifier definitions have been processed:
	 * 1. Generate all declaration files for each root node or fail
	 * 2. Get transient nodes from the declaration files and collect those as well
	 *
	 * @param parentNode tsm.Node
	 */
	function _traverse(parentNode: tsm.Node) {
		const sourceFile = parentNode.getSourceFile();

		parentNode.getDescendantsOfKind(tsm.SyntaxKind.Identifier).forEach((id) => {
			if (isJsDocChild(id)) {
				return;
			}

			let definitionNodes = getDefinitionNodes(id, inProject, true);

			for (const defNode of definitionNodes) {
				// minor optimization to reduce work in this loop
				if (_alreadyTriedToCollectNode.has(defNode)) {
					continue;
				}
				_alreadyTriedToCollectNode.add(defNode);

				if (defNode.getSourceFile().isFromExternalLibrary()) {
					result.diagnostics.external.add(id.getText());
					continue;
				}
				if (defNode.getSourceFile().isInNodeModules()) {
					// add node name to import list since it is external
					nodeModuleImports.registerImports(id, sourceFile);
					result.diagnostics.nodeModules.add(id.getText());
					continue;
				}
				if (defNode.getSourceFile().isDeclarationFile()) {
					nodeModuleDeclarationImports.registerImports(id, sourceFile);
					result.diagnostics.externalDeclarations.add(id.getText());
					continue;
				}
				_collect(defNode);
				_traverse(defNode);
			}

			if (definitionNodes.length === 0) {
				result.diagnostics.notFound.add(id.getText());
			}
		});

		// we emit the declaration after collecting exportable nodes
		// because we need to set them all to exported first!
		const declarationFile = emitFileDeclaration(
			inProject,
			parentNode.getSourceFile(),
			outProject,
		);

		if (declarationFile === undefined) {
			console.error(parentNode.getSourceFile().getFilePath());
			throw new Error("Could not emit file declaration");
		}

		for (const transient of declarationFile
			.getDescendantsOfKind(tsm.SyntaxKind.ImportType)
			.map((node) => ({
				node,
				sourceFile,
				declarationFile,
			}))) {
			_transients.add(transient);
		}

		// const transient = replaceTransientImports(
		//     declarationFile,
		//     parentNode.getSourceFile(),
		//     inProject,
		//     result.diagnostics
		// );

		// for (const node of transient) {
		//     _transients.add(node);
		//     _collect(node);
		//     _traverse(node);
		// }
	}

	/**
	 * NOTE: This is a recursive function
	 *
	 * For any given node definition:
	 * 1. Retrieve its matching declaration and output it.
	 * 2. For each descendent of the declaration node, if it has an id and has been collected, output it.
	 * 3. If it does not have a declaration and is a declaration itself, output it.
	 */
	function printNode(_node: tsm.Node, srcDecl?: tsm.Node) {
		const outputNode = getStatement(_node);

		if (_printedNodeDeclarations.has(outputNode)) {
			return;
		}
		_printedNodeDeclarations.add(outputNode);

		const declNode = getDeclarationNode(outputNode, inProject, outProject);

		if (declNode) {
			outputNodeText(declNode, outputNode.getSourceFile(), result, {
				wrapInGlobal,
				defaultInternal,
			});

			declNode.forEachDescendant((desc) => {
				const nodeId = getNodeId(desc);
				if (nodeId) {
					// same id doesn't mean we're in the same tree, though we're assuming so
					const collectedNodeList = _collectedNodeDefinitionsListMap.get(
						nodeId.getText(),
					);
					if (collectedNodeList === undefined) {
						// we don't have any node definitions for this id
						// see if any external imports map to the symbol name
						if (hasOwnIdentifier(desc)) {
							if (
								!nodeModuleImports.prepareOutput(desc) &&
								!nodeModuleDeclarationImports.prepareOutput(desc)
							) {
								result.diagnostics.failedToPrint.add(nodeId.getText());
							}
						}
					} else if (collectedNodeList.length > 1) {
						// we support exporting interface and class with same name as TS does
						if (
							collectedNodeList.length === 2 &&
							collectedNodeList.some((node) =>
								tsm.Node.isClassDeclaration(node),
							) &&
							collectedNodeList.some((node) =>
								tsm.Node.isInterfaceDeclaration(node),
							)
						) {
							printNode(collectedNodeList[0], declNode);
							printNode(collectedNodeList[1], declNode);
						} else {
							result.diagnostics.nameClash.add(nodeId.getText());
						}
					} else if (collectedNodeList.length === 1) {
						printNode(collectedNodeList[0], declNode);
					}
				}
			});
		} else {
			// there will not be a declaration node if:
			// the node is not an exportable type
			// the node is not exported
			// however in our case we wish to include non-exported for convenience
			// so we will just print the node
			// we have to reach up and find out if parents have decl nodes
			// NOTE: now that we set nodes to export before hand, it will be odd to find nodes in this execution branch
			if (
				srcDecl &&
				// do we want just type reference?
				(isDeclaration(outputNode) || tsm.Node.isTypeReference(outputNode)) &&
				isReferencedByAncestorDeclaration(outputNode, srcDecl!)
			) {
				if (tsm.Node.isJSDocable(outputNode)) {
					outputNode.addJsDoc("@internal - inferred");
				}
				result.content +=
					`\n\n//${outputNode.getSourceFile().getFilePath()}\n` +
					outputNode.getFullText();
				_printedNodeDeclarations.add(outputNode);
			}
		}
	}

	function _collect(node: tsm.Node) {
		if (hasOwnIdentifier(node) && isExportable(node)) {
			if (!_collectedNodeDefinitions.includes(node)) {
				const nodeId = getNodeId(node)!.getText();
				_collectedNodeDefinitions.push(node);
				if (_collectedNodeDefinitionsListMap.has(nodeId)) {
					_collectedNodeDefinitionsListMap.get(nodeId)!.push(node);
				} else {
					_collectedNodeDefinitionsListMap.set(nodeId, [node]);
				}

				// set all nodes to exported so we can get declarations from TS
				getExportableNode(node).setIsExported(true);
			}
		}
	}

	let sourceFile: tsm.SourceFile;
	// best effort for faulty configs
	if (inProject.getSourceFile(file) === undefined) {
		sourceFile = inProject.addSourceFileAtPath(file);
		console.warn(`File ${file} not found in tsconfig.json, adding...`);
	} else {
		sourceFile = inProject.getSourceFile(file);
	}

	_traverse(sourceFile);

	for (const t of _transients) {
		try {
			console.log(t.node.getFullText());
			_collect(replaceTransientImport(t, inProject, result.diagnostics));
		} catch (e) {
			console.error(e);
		}
	}

	const rootNodes = [
		...(sourceFile.getExportedDeclarations().values() as Iterable<tsm.Node>),
	].flat();

	// start at the root nodes of the source file and print only those types that are referenced from there
	for (const node of rootNodes) {
		printNode(node);
	}

	result.content =
		nodeModuleImports.output +
		"\n" +
		nodeModuleDeclarationImports.output +
		"\n" +
		result.content;

	return {
		content: `
        ${prefix}
        ${result.content}
        declare global {
            ${globalExternals.join("\n")}
            ${result.global}
        }
        `,
		diagnostics: {
			external: [...result.diagnostics.external],
			importFileNotFound: [...result.diagnostics.importFileNotFound],
			nodeModules: [...result.diagnostics.nodeModules],
			notFound: [...result.diagnostics.notFound],
			...nodeModuleImports.diagnostics,
			nameClash: [...result.diagnostics.nameClash],
			failedToPrint: [...result.diagnostics.failedToPrint],
		},
	};
};
