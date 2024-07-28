import { OpenAPIV3 } from "openapi-types";
import * as TJS from "typescript-json-schema";
import fs from "fs";
import path from "path";

export function generateOpenAPISpec(
	schemas: Record<string, TJS.Definition>,
): OpenAPIV3.Document {
	const paths: OpenAPIV3.PathsObject = {};
	const components: OpenAPIV3.ComponentsObject = {
		schemas: {},
	};

	for (const [method, schema] of Object.entries(schemas)) {
		if (schema.properties) {
			for (const [path, pathSchema] of Object.entries(schema.properties)) {
				if (!paths[path]) {
					paths[path] = {};
				}

				const operation: OpenAPIV3.OperationObject = {
					parameters: createParameters(pathSchema.properties?.parameters),
					responses: createResponses(
						pathSchema.properties?.responses,
						pathSchema.properties?.errors,
					),
				};

				if (method !== "GET") {
					operation.requestBody = createRequestBody(
						pathSchema.properties?.parameters,
					);
				}

				paths[path][method.toLowerCase() as OpenAPIV3.HttpMethods] = operation;
			}
		}

		// Add schemas to components
		if (schema.definitions) {
			Object.assign(components.schemas!, schema.definitions);
		}
	}

	return {
		openapi: "3.0.0",
		info: {
			title: "API",
			version: "1.0.0",
		},
		paths,
		components,
	};
}

function createParameters(parameters: any): OpenAPIV3.ParameterObject[] {
	const openAPIParameters: OpenAPIV3.ParameterObject[] = [];

	if (parameters && parameters.properties) {
		if (parameters.properties.path) {
			for (const [name, schema] of Object.entries(
				parameters.properties.path.properties,
			)) {
				openAPIParameters.push({
					name,
					in: "path",
					required: true,
					schema: schema as OpenAPIV3.SchemaObject,
				});
			}
		}

		if (parameters.properties.query) {
			for (const [name, schema] of Object.entries(
				parameters.properties.query.properties,
			)) {
				openAPIParameters.push({
					name,
					in: "query",
					schema: schema as OpenAPIV3.SchemaObject,
				});
			}
		}
	}

	return openAPIParameters;
}

function createRequestBody(
	parameters: any,
): OpenAPIV3.RequestBodyObject | undefined {
	if (parameters && parameters.properties && parameters.properties.body) {
		return {
			content: {
				"application/json": {
					schema: parameters.properties.body,
				},
			},
		};
	}
	return undefined;
}

function createResponses(
	responses: any,
	errors: any,
): OpenAPIV3.ResponsesObject {
	const openAPIResponses: OpenAPIV3.ResponsesObject = {};

	if (responses && responses.properties) {
		for (const [status, responseSchema] of Object.entries(
			responses.properties,
		)) {
			openAPIResponses[status] = {
				description: `${status} response`,
				content: {
					"application/json": {
						schema: responseSchema as OpenAPIV3.SchemaObject,
					},
				},
			};
		}
	}

	if (errors && errors.properties) {
		for (const [status, errorSchema] of Object.entries(errors.properties)) {
			openAPIResponses[status] = {
				description: `${status} error response`,
				content: {
					"application/json": {
						schema: errorSchema as OpenAPIV3.SchemaObject,
					},
				},
			};
		}
	}

	return openAPIResponses;
}
