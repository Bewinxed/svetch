import * as path from "node:path";
import * as fs from "node:fs";
import prompts, { type PromptObject } from "prompts";
import { log } from "./utils/logger.js";
import { main } from "./generator.js";
import { performance } from "node:perf_hooks";
import ora, { oraPromise } from "ora";
import { spinner } from "./utils/ux/spinner.js";

const separator = "--------------------------------------";

interface ScriptArgs {
	framework: string;
	input: string;
	staticFolder: string;
	out: string;
	docs: string;
	tsconfig: string;
	logLevel?: number;
	filter?: string | null;
	telemetry: boolean;
}

const defaultArgs: ScriptArgs = {
	framework: "sveltekit",
	input: "src/routes/api",
	out: "src/lib/api",
	docs: "src/routes/docs",
	staticFolder: "static",
	tsconfig: "tsconfig.json",
	logLevel: 5,
	filter: null,
	telemetry: true,
};

const isInit = process.argv[2] === "init";

// Get the command-line arguments
const args: string[] = process.argv.slice(3);

function parseArgs(rawArgs: string[]): ScriptArgs {
	const svetchrcExists = fs.existsSync(".svetchrc");
	const parsedArgs = svetchrcExists ? readSvetchrc() : {};

	for (let i = 0; i < rawArgs.length; i += 2) {
		const argName = rawArgs[i]?.replace("--", "");
		const argValue = rawArgs[i + 1];
		if (argName && argValue) {
			parsedArgs[argName] = argValue;
		}
	}

	return { ...defaultArgs, ...parsedArgs };
}

const workingDir = process.cwd();
export async function initSvetchrc() {
	console.log(`
  #  ███████╗██╗   ██╗███████╗████████╗ ██████╗██╗  ██╗
  #  ██╔════╝██║   ██║██╔════╝╚══██╔══╝██╔════╝██║  ██║
  #  ███████╗██║   ██║█████╗     ██║   ██║     ███████║
  #  ╚════██║╚██╗ ██╔╝██╔══╝     ██║   ██║     ██╔══██║
  #  ███████║ ╚████╔╝ ███████╗   ██║   ╚██████╗██║  ██║
  #  ╚══════╝  ╚═══╝  ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
  #   NEVER TYPE YOUR TYPES TWICE
      Send any feedback or issues here 👉 https://github.com/Bewinxed/svetch/
`);

	if (fs.existsSync(".svetchrc")) {
		fs.renameSync(".svetchrc", ".svetchrc.backup");
		spinner.warn(
			"Existing .svetchrc file has been renamed to .svetchrc.backup",
		);
	}

	const questions: PromptObject[] = [
		{
			type: "text",
			name: "input",
			message: "Which folder would you like svetch to scan for API routes?",
			initial: defaultArgs.input,
		},
		{
			type: "text",
			name: "out",
			message:
				"Where would you like svetch to output the generated API files? (The Client/Types/Zod Schemas will be written here)",
			initial: defaultArgs.out,
		},
		{
			type: "text",
			name: "docs",
			message:
				"Where would you like svetch to output the generated API documentation?",
			initial: defaultArgs.docs,
		},
		{
			type: "text",
			name: "staticFolder",
			message: "Where is your static folder located?",
			initial: defaultArgs.staticFolder,
		},
	];

	const response = await prompts(questions);

	fs.writeFileSync(
		".svetchrc",
		JSON.stringify({ ...defaultArgs, ...response }, null, 2),
	);

	spinner.start(
		`Svetch configuration written to ${path.resolve(workingDir, ".svetchrc")}`,
	);
}

function readSvetchrc() {
	try {
		const config_file = fs.readFileSync(".svetchrc", "utf8");
		const config = JSON.parse(config_file) as ScriptArgs;
		return config;
	} catch (error) {
		console.error("Error reading .svetchrc file:", error);
		process.exit(1);
	}
}

export async function runAll() {
	const start = performance.now();

	try {
		if (isInit || !fs.existsSync(path.resolve(workingDir, ".svetchrc"))) {
			await initSvetchrc();
		}
		const spinner = ora({ color: "yellow" }).start("Starting task");
		await main(parseArgs(args));
		const end = performance.now();
		spinner.succeed(`Task completed in ${(end - start).toFixed(2)}ms`);
	} catch (error) {
		spinner.fail(`Task failed: ${(error as Error).message}`);
		console.error(error);
		throw error;
	} finally {
		process.exit(0);
	}
}
