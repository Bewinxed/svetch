export interface FormattedType {
  typeString: string;
  imports: Set<string>;
}

export type EndpointDefinition = {
  parameters?: FormattedType;
  responses?: Partial<Record<number, any[]>>;
  errors?: Record<string, any[]>;
  docs?: string;
  imports?: Set<string>;
};