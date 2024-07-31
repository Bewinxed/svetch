import type { Node } from "ts-morph";

export interface FormattedType {
	typeString?: string;
	imports?: Set<string>;
}

export interface ErrorDetails<T extends Node> {
	status: number;
	type_string?: string;
	node: T;
}

export type EndpointDefinition = {
	parameters: {
		body?: FormattedType;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		path?: Record<string, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		query?: Record<string, any>;
	};
	responses: Partial<Record<number, FormattedType[]>>;
	errors: Record<string, FormattedType[]>;
	docs?: string;
	imports: Set<string>;
};

export type MethodMap = Map<HTTP_METHOD, EndpointDefinition>;

export type Endpoints = Map<string, MethodMap>;

export type HTTP_METHOD =
	| "GET"
	| "POST"
	| "PUT"
	| "DELETE"
	| "PATCH"
	| "HEAD"
	| "OPTIONS"
	| "TRACE"
	| "CONNECT";

export type ScriptArgs = {
	framework: string;
	input: string;
	staticFolder: string;
	out: string;
	docs: string;
	tsconfig: string;
	logLevel?: number;
	filter?: string | null;
	telemetry: boolean;
};
