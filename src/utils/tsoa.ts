import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import type {
	EndpointDefinition,
	Endpoints,
	MethodMap,
} from "../types/core.js";
import {
	generateRoutes,
	generateSpec,
	type ExtendedRoutesConfig,
	type ExtendedSpecConfig,
} from "tsoa";
import path from "node:path";
import { brackets, newline } from "./writers.js";

export async function generate_tsoa_shema(
	endpoints: Endpoints,
	staticFolder: string,
) {
	// const routeOptions: ExtendedRoutesConfig = {
	// 	basePath: "/api",
	// 	entryFile: "./tsoa/server.ts",
	// 	routesDir: "./tsoa",
	// 	noImplicitAdditionalProperties: "silently-remove-extras",
	// 	bodyCoercion: true,
	// };

	for (const [api_path, method_map] of endpoints.entries()) {
		const controller = generate_tsoa_controller(api_path, method_map);
		if (controller) {
			await write_route_controller(api_path, controller, staticFolder);
		}
	}

	await write_spec(staticFolder);
}

function generate_tsoa_controller(path: string, method_map: MethodMap) {
	const imports = new Set<string>([
		'import { Body, Controller, Response,Route, SuccessResponse } from "tsoa";',
	]);

	const controller_name = path
		.replace(/:(\w+)/g, "$1")
		.replace(/\//g, "")
		.replace(/-/g, "");

	const endpoint = generate_route_controller(path, method_map);
	// biome-ignore lint/complexity/noForEach: <explanation>
	endpoint.imports.forEach((imp) => imports.add(imp));

	let output = `
        @Route("${path}")
        export class ${controller_name}Controller extends Controller`;
	output += newline(brackets(endpoint.output));
	output = [Array.from(imports).join("\n"), output].join("\n");
	return output;
}

function generate_route_controller(
	api_path: string,
	method_map: MethodMap,
): {
	imports: Set<string>;
	output: string;
} {
	const imports = new Set<string>();
	let output = "";
	for (const [method, endpoint] of method_map.entries()) {
		const method_name = method.slice(0, 1) + method.slice(1).toLowerCase();
		// capitalize
		imports.add(
			`import { ${method.slice(0, 1)}${method.slice(1).toLowerCase()} } from "tsoa";`,
		);

		output += `
        @${method_name}()`;
		const responses = generate_endpoint_responses(endpoint);
		output += responses.responses.join("\n");
		for (const imp of responses.imports) {
			imports.add(imp);
		}
		const args: string[] = [];

		output += `public async ${method_name.toLowerCase()}(`;

		if (endpoint.parameters.path) {
			Object.entries(endpoint.parameters.path).map(([key, value]) =>
				args.push(`@Path() ${key}: ${value}`),
			);
		}

		if (endpoint.parameters.body) {
			if (endpoint.parameters.body.imports) {
				for (const imp of endpoint.parameters.body.imports) {
					imports.add(imp);
				}
			}
			args.push(`@Body() body: ${endpoint.parameters.body.typeString}`);
		}
		// else {
		// 	output += `public async ${method_name.toLowerCase()}(): Promise<void> {
		//         return;
		//     }`;
		// }

		if (endpoint.parameters.query) {
			imports.add('import { Query } from "tsoa";');
			Object.entries(endpoint.parameters.query)
				.map(([key, value]) => {
					args.push(`@Query() ${key}: ${value}`);
				})
				.join(",");
		}
		output += `
        ${args.join("\n,")}
        ) {
                return ${endpoint.responses[200]?.at(0)?.typeString ? `({} as ${endpoint.responses[200]?.at(0)?.typeString})` : ""};
            }`;
	}

	return { imports, output };
}

async function write_route_controller(
	api_path: string,
	output: string,
	staticFolder: string,
) {
	const output_path = path.join(
		staticFolder,
		"tsoa",
		"controllers",
		api_path.replace(/:(\w+)/g, "{$1}"),
	);
	// create dir
	if (!existsSync(output_path)) {
		await fs.mkdir(output_path, { recursive: true });
	}
	await fs.writeFile(path.join(output_path, "Controller.ts"), output);
}

function generate_endpoint_responses(endpoint: EndpointDefinition): {
	responses: string[];
	imports: Set<string>;
} {
	const imports = new Set<string>();
	const responses: string[] = [];
	for (const [status, res] of Object.entries(endpoint.responses)) {
		if (res) {
			const responses: string[] = [];
			for (const response of res) {
				response.imports?.forEach((imp, i) => imports.add(imp));
				if (response.typeString) {
					responses.push(response.typeString);
				}
			}
			const http_status = Number.parseInt(status);
			responses.push(`@Response<${responses.join(" | ")}>(${http_status})\n`);
		}
	}
	for (const [status, res] of Object.entries(endpoint.errors)) {
		if (res) {
			for (const response of res) {
				if (response.imports) {
					for (const imp of response.imports) {
						imports.add(imp);
					}

					const http_status = Number.parseInt(status);

					responses.push(`@Response<${response.typeString}>(${http_status})\n`);
				}
			}
		}
	}
	return { responses, imports };
}

async function write_spec(staticFolder: string) {
	const tsoa_working_dir = path.join(staticFolder, "tsoa");
	const spec_output_path = path.join(staticFolder, "api", "schemas");
	if (!existsSync(tsoa_working_dir)) {
		await fs.mkdir(tsoa_working_dir, { recursive: true });
	}
	await generateSpec({
		basePath: "/api",
		entryFile: `${path.join(tsoa_working_dir, "server.ts")}`,
		specVersion: 3,
		outputDirectory: spec_output_path,
		controllerPathGlobs: [
			path.join(tsoa_working_dir, "controllers/**/*Controller.ts"),
		],
		noImplicitAdditionalProperties: "silently-remove-extras",
	}).then(async () => {
		await fs.rm(tsoa_working_dir, { recursive: true, force: true });
	});
}
