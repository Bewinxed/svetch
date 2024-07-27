import { Project, type SourceFile, type Node } from "ts-morph";

export function mock_node<T extends Node>(
	node: T,
	source_text: string,
): SourceFile {
	const project = new Project({
		compilerOptions: { allowJs: true },
		useInMemoryFileSystem: true,
	});
	const source = project.createSourceFile(
		node.getSourceFile().getFilePath(),
		source_text,
	);
	return source;
}
