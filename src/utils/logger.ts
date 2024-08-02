import ansiColors from "ansi-colors";
import type { Node } from "ts-morph";

class Log {
	private console_colors = {
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		gray: "\x1b[90m",
		reset: "\x1b[0m",
		black: "\x1b[30m",
	};

	private logLevel: number;
	private filter: string | null;

	constructor(logLevel: number = 5, filter: string | null = null) {
		// default log level is 5, which shows all logs
		this.logLevel = logLevel;
		this.filter = filter;
	}

	private log(
		color: keyof typeof this.console_colors,
		nesting: number = 1,
		...args: any[]
	) {
		const formattedArgs = args.map((arg) => {
			if (typeof arg === "object") {
				// Convert the object to a JSON string with 2-space indentation
				let json = JSON.stringify(arg, null, 2);
				// Split the JSON string into lines so we can add indentation to each line
				let lines = json.split("\n");
				// Add the appropriate indentation to each line
				let padding = "    ".repeat(nesting);
				lines = lines.map((line) => {
					// Check if line is a valid JSON string, if so parse it
					try {
						const parsedJSON = JSON.parse(line.trim());
						// If it's parsable, it's a stringified JSON, so we format it with the appropriate indentation
						return (
							padding +
							JSON.stringify(parsedJSON, null, 2).replace(/\n/g, "\n" + padding)
						);
					} catch (e) {
						// If it's not parsable, it's a regular string so we just return it
						return padding + line;
					}
				});
				// Join the lines back together into a single string
				return lines.join("\n");
			} else {
				// Non-object arguments are not modified
				return arg;
			}
		});

		console.log(
			`${this.console_colors[color]}${"    ".repeat(nesting - 1)}${
				nesting > 1 ? "↳  " : ""
			}${formattedArgs.join(" ")}${this.console_colors.reset}`,
		);
	}

	header(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 0 && (!this.filter || this.filter === "header")) {
			this.log("cyan", nesting, ...args);
		}
	}

	success(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 1 && (!this.filter || this.filter === "success")) {
			this.log("green", nesting, "✅ [SUCCESS]:	", ...args);
		}
	}

	info(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 2 && (!this.filter || this.filter === "info")) {
			this.log("blue", nesting, "🗒 [INFO]:	", ...args);
		}
	}

	warn(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 3 && (!this.filter || this.filter === "warn")) {
			this.log("yellow", nesting, "⚠️ [WARN]:	", ...args);
		}
	}

	error(nesting: number = 1, ...args: any[]) {
		// telemetryPayload.data.encountered_errors = true;
		// telemetryPayload.data.error_messages.push(args.join(' '));
		if (this.logLevel >= 4 && (!this.filter || this.filter === "error")) {
			this.log("red", nesting, "🚨 [ERROR]:	", ...args);
		}
	}

	debug(nesting: number = 1, ...args: any[]) {
		if (this.logLevel >= 5 && (!this.filter || this.filter === "debug")) {
			this.log("gray", nesting, "🐛 [DEBUG]:	", ...args);
		}
	}
}

export const log = new Log();

export function log_node_with_location<T extends Node>(node: T) {
	return `${ansiColors.red("▸")} file:  ${ansiColors.green(
		node.getSourceFile().getFilePath(),
	)}${ansiColors.magenta(`:${node.getStartLineNumber()}`)}	
	${ansiColors.red("▸")} type: ${ansiColors.green(node?.getKindName())}
	${ansiColors.red("▸")} snippet:
	${ansiColors.yellow(`------
	${node.getText()}
	------`)}`;
}

export function node_location_and_line<T extends Node>(declaration: T) {
	return `${ansiColors.green(
		absolute_to_relative(declaration.getSourceFile().getFilePath()),
	)}${ansiColors.magenta(`:${declaration.getStartLineNumber()}`)}`;
}

export function absolute_to_relative(path: string) {
	return path.replace(process.cwd(), "");
}

export function node_text_snippet(node: Node) {
	const text = node.getText();
	const start = Math.max(0, text.lastIndexOf("\n", 100));
	const end = Math.min(text.length, text.indexOf("\n", 300));
	return text.slice(start, end);
}
