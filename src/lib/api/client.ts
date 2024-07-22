import type { APIPaths } from './api'
import type { APIPaths } from './api'

export type Fetch = (input: string | RequestInfo | URL, init?: RequestInit) => Promise<Response>

type EndpointMethod<EP extends keyof APIPaths, M extends keyof APIPaths[EP]> = APIPaths[EP][M]

type Params<M extends EndpointMethod<any, any>> = M extends { parameters: infer P }
	? { [K in keyof P]: undefined extends P[K] ? P[K] | undefined : P[K] }
	: never

type SuccessResponse<M extends EndpointMethod<any, any>> = M extends { responses: { 200: infer S } }
	? S
	: never

type ErrorResponse<M extends EndpointMethod<any, any>> = M extends { errors: infer E } ? E : never

type ExtendedResponse<EP extends keyof APIPaths, M extends keyof APIPaths[EP]> = Response & {
	data?: SuccessResponse<APIPaths[EP][M]>
	error?: ErrorResponse<APIPaths[EP][M]>
}

type EndpointsSupportingMethod<M extends keyof any, API extends Record<string, any>> = {
	[K in keyof API]: M extends keyof API[K] ? K : never
}[keyof API]

export class Svetch {
	private baseURL: string
	private fetch: Fetch
	private validate: boolean

	constructor(baseURL: string = '', fetchInstance?: Fetch, validate: boolean = true) {
		this.baseURL = baseURL
		this.fetch = fetchInstance || (fetch as Fetch)
		this.validate = false
	}

	error(status: number, message: string) {
		const err = new Error(message)
		// @ts-ignore
		err.sta
	}

	async request<EP extends keyof APIPaths, M extends keyof APIPaths[EP]>(
		endpoint: EP,
		method: M,
		options: Params<EndpointMethod<EP, M>>
	): Promise<ExtendedResponse<EP, M>> {
		const { path, query, body } = options
		let updatedEndpoint = endpoint as string

		if (path) {
			for (const [key, value] of Object.entries(path)) {
				updatedEndpoint = updatedEndpoint.replace(`:${key}`, value as string)
			}
		}

		let queryStr = ''
		if (query) {
			queryStr =
				'?' +
				Object.entries(query)
					.map(([key, value]) => `${key}=${value.toString()}`)
					.join('&')
		}

		if (this.validate && body) {
			try {
				schema.shape[endpoint]?.shape[method]?.shape.parameters.shape.body.parse(body)
			} catch (err) {
				console.log(`Request body is invalid`, err)
				throw err
			}
		}

		const response: ExtendedResponse<EP, M> = (await this.fetch(
			`${this.baseURL}/${updatedEndpoint + queryStr}`,
			{
				body: JSON.stringify(body),
				method: method as string
			}
		)) as ExtendedResponse<EP, M>

		if (!response.ok) {
			const errorResponse = await response.json()
			response.error = errorResponse as ErrorResponse<APIPaths[EP][M]>
			return response
		}

		const responseData = await response.json()

		if (this.validate && responseData) {
			try {
				schema.shape[endpoint]?.shape[method]?.shape.responses.shape[response.status].parse(
					responseData
				)
			} catch (err) {
				console.log(`Response data is invalid`, err)
			}
		}
		response.data = responseData as SuccessResponse<APIPaths[EP][M]>
		return response
	}

	get<EP extends EndpointsSupportingMethod<'GET', APIPaths>, M extends 'GET' & keyof APIPaths[EP]>(
		endpoint: EP,
		parameters: Params<EndpointMethod<EP, M>>
	) {
		return this.request(endpoint, 'GET', parameters)
	}

	post<
		EP extends EndpointsSupportingMethod<'POST', APIPaths>,
		M extends 'POST' & keyof APIPaths[EP]
	>(endpoint: EP, parameters: Params<EndpointMethod<EP, M>>) {
		return this.request(endpoint, 'POST', parameters)
	}

	put<EP extends EndpointsSupportingMethod<'PUT', APIPaths>, M extends 'PUT' & keyof APIPaths[EP]>(
		endpoint: EP,
		parameters: Params<EndpointMethod<EP, M>>
	) {
		return this.request(endpoint, 'PUT', parameters)
	}

	patch<
		EP extends EndpointsSupportingMethod<'PATCH', APIPaths>,
		M extends 'PATCH' & keyof APIPaths[EP]
	>(endpoint: EP, parameters: Params<EndpointMethod<EP, M>>) {
		return this.request(endpoint, 'PATCH', parameters)
	}

	delete<
		EP extends EndpointsSupportingMethod<'DELETE', APIPaths>,
		M extends 'DELETE' & keyof APIPaths[EP]
	>(endpoint: EP, parameters: Params<EndpointMethod<EP, M>>) {
		return this.request(endpoint, 'DELETE', parameters)
	}
}

export const SvelteClient = new Svetch()
