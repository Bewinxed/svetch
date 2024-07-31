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

export async function generate_tsoa_shema(endpoints: Endpoints) {
	const specOptions: ExtendedSpecConfig = {
		basePath: "/api",
		entryFile: "./tsoa/server.ts",
		specVersion: 3,
		outputDirectory: "./tsoa/api/dist",
		controllerPathGlobs: ["./tsoa/routeControllers/**/*Controller.ts"],
		noImplicitAdditionalProperties: "silently-remove-extras",
	};
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
			await write_route_controller(api_path, controller);
		}
	}

	await generateSpec(specOptions);
}

function generate_tsoa_controller(path: string, method_map: MethodMap) {
	const imports = new Set<string>([
		'import { Body, Controller, Response,Route, SuccessResponse } from "tsoa";',
	]);

	const controller_name = path
		.replace(/:(\w+)/g, "$1")
		.replace(/\//g, "")
		.replace(/-/g, "");

	let output = `
        @Route("${path}")
        export class ${controller_name}Controller extends Controller {
        `;

	for (const [method, endpoint] of method_map.entries()) {
		const method_name = method.slice(0, 1) + method.slice(1).toLowerCase();
		// capitalize
		imports.add(
			`import { ${method.slice(0, 1)}${method.slice(1).toLowerCase()} } from "tsoa";`,
		);

		output += `
        @${method_name}()`;
		const responses = generate_endpoint_responses(endpoint);
		for (const response of responses.responses) {
			output += response;
		}
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
        ): Promise<void> {
                return;
            }`;
	}

	output += `
    }`;

	output = `${Array.from(imports).join("\n")}\n${output}`;
	return output;
}

async function write_route_controller(api_path: string, output: string) {
	const output_path = path.join(
		process.cwd(),
		"tsoa",
		"routeControllers",
		api_path.replace(/:(\w+)/g, "{$1}"),
	);
	console.error(output_path);

	// create dir
	if (!existsSync(output_path)) {
		console.error(output_path);
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
