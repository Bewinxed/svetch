import type { GET, POST, PUT, PATCH, DELETE } from "./api.js";

const APIPaths = {
	GET: {} as GET,
	POST: {} as POST,
	PUT: {} as PUT,
	PATCH: {} as PATCH,
	DELETE: {} as DELETE,
} as const;

type APIPaths = typeof APIPaths;

type EndpointMethod<
	EP extends keyof APIPaths,
	M extends keyof APIPaths[EP],
> = APIPaths[EP][M];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Params<M extends EndpointMethod<any, any>> = M extends {
	parameters: infer P;
}
	? { [K in keyof P]: undefined extends P[K] ? P[K] | undefined : P[K] }
	: never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type SuccessResponse<M extends EndpointMethod<any, any>> = M extends {
	responses: { 200: infer S };
}
	? S
	: never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ErrorResponse<M extends EndpointMethod<any, any>> = M extends {
	errors: infer E;
}
	? E
	: never;

type ExtendedResponse<
	EP extends keyof APIPaths,
	K extends keyof APIPaths[EP],
> = Response & {
	data?: SuccessResponse<APIPaths[EP][K]>;
	error?: ErrorResponse<APIPaths[EP][K]>;
};

export class Svetch {
	private baseURL: string;
	private fetchFn: typeof fetch;
	private validate: boolean;

	constructor(baseURL = "", fetchInstance?: typeof fetch, validate = true) {
		this.baseURL = baseURL;
		this.fetchFn = fetchInstance || fetch;
		this.validate = validate;
	}

	error(status: number, message: string) {
		const err = new Error(message);
		// @ts-ignore
		err.status = status;
		throw err;
	}

	async request<M extends keyof APIPaths, EP extends keyof APIPaths[M]>(
		endpoint: EP,
		method: M,
		options: Params<EndpointMethod<M, EP>>,
	): Promise<ExtendedResponse<M, EP>> {
		const { path, query, body } = options as unknown as {
			path?: { [key: string]: string };
			query?: { [key: string]: unknown };
			body?: {
				[key: string]: unknown;
			};
		};
		let updatedEndpoint = endpoint as string;

		if (path) {
			for (const [key, value] of Object.entries(path)) {
				if (value === undefined) {
					console.warn(`Path parameter ${key} is undefined, skipping`);
					continue;
				}
				updatedEndpoint = updatedEndpoint.replace(`:${key}`, value as string);
			}
		}

		const query_params = new URLSearchParams();
		if (query) {
			for (const [key, value] of Object.entries(query)) {
				if (value === undefined) {
					console.warn(`Query parameter ${key} is undefined, skipping`);
					continue;
				}
				if (value) {
					query_params.append(key, value.toString());
				}
			}
		}

		if (this.validate && body) {
			try {
				// @ts-ignore
				schema.shape[endpoint]?.shape[
					method
				]?.shape.parameters.shape.body.parse(body);
			} catch (err) {
				console.error("SVETCH: Request body is invalid", err);
				throw err;
			}
		}

		const response = (await this.fetchFn(
			`${this.baseURL}/${updatedEndpoint + query_params}`,
			{
				body: JSON.stringify(body),
				method: method as string,
			},
		)) as ExtendedResponse<M, EP>;

		if (!response.ok) {
			const errorResponse = await response.json();
			response.error = { [response.status]: errorResponse } as ErrorResponse<
				APIPaths[M][EP]
			>;
			return response;
		}

		const responseData = (await response.json()) as SuccessResponse<
			APIPaths[M][EP]
		>;

		if (this.validate && responseData) {
			try {
				// @ts-ignore
				schema.shape[endpoint]?.shape[method]?.shape.responses.shape[
					response.status
				].parse(responseData);
			} catch (err) {
				console.log("SVETCH: Response data is invalid", err);
			}
		}
		response.data = responseData;
		return response;
	}

	get<EP extends keyof GET>(endpoint: EP, parameters: Params<GET[EP]>) {
		return this.request(endpoint, "GET", parameters);
	}

	post<EP extends keyof POST>(endpoint: EP, parameters: Params<POST[EP]>) {
		return this.request(endpoint, "POST", parameters);
	}

	put<EP extends keyof PUT>(endpoint: EP, parameters: Params<PUT[EP]>) {
		return this.request(endpoint, "PUT", parameters);
	}

	patch<EP extends keyof PATCH>(endpoint: EP, parameters: Params<PATCH[EP]>) {
		return this.request(endpoint, "PATCH", parameters);
	}

	delete<EP extends keyof DELETE>(
		endpoint: EP,
		parameters: Params<DELETE[EP]>,
	) {
		return this.request(endpoint, "DELETE", parameters);
	}
}
