import type { Node } from "ts-morph";
import crypto from "node:crypto";

export function hashNode(node: Node): string {
	const hashContent = node.getText();
	const hash = crypto.createHash("sha256");
	hash.update(hashContent);
	return hash.digest("hex");
}
