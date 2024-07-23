export interface FormattedType {
  typeString?: string;
  imports?: Set<string>;
}

export type EndpointDefinition = {
  parameters?: {
    body?: FormattedType;
    path?: Record<string, any>;
    query?: Record<string, any>;
  };
  responses?: Partial<Record<number, FormattedType[]>>;
  errors?: Record<string, any[]>;
  docs?: string;
  imports?: Set<string>;
};

export type Endpoints = Map<string, Map<HTTP_METHOD, EndpointDefinition>>;

export type HTTP_METHOD =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT';

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
