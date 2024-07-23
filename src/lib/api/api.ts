export interface Get<
  PathParams = { [key: string]: unknown },
  QueryParams = { [key: string]: unknown },
  Output = { [key: string]: unknown }
> {
  parameters: {
    path?: PathParams;
    query: QueryParams;
  };
  responses: {
    200: Output;
  };
}

export interface Post<
  PathParams = { [key: string]: unknown },
  RequestBody = { [key: string]: unknown },
  QueryParams = { [key: string]: unknown },
  Output = { [key: string]: unknown }
> {
  parameters: {
    path?: PathParams;
    body: RequestBody;
    query?: QueryParams;
  };
  responses: {
    200: Output;
  };
}

export interface Put<
  PathParams = { [key: string]: unknown },
  RequestBody = { [key: string]: unknown },
  QueryParams = { [key: string]: unknown },
  Output = { [key: string]: unknown }
> {
  parameters: {
    path?: PathParams;
    body: RequestBody;
    query?: QueryParams;
  };
  responses: {
    200: Output;
  };
}

export interface Delete<
  PathParams = { [key: string]: unknown },
  QueryParams = { [key: string]: unknown },
  Output = { [key: string]: unknown }
> {
  parameters: {
    path?: PathParams;
    query: QueryParams;
  };
  responses: {
    200: Output;
  };
}

export interface Patch<
  PathParams = { [key: string]: unknown },
  RequestBody = { [key: string]: unknown },
  QueryParams = { [key: string]: unknown },
  Output = { [key: string]: unknown }
> {
  parameters: {
    path?: PathParams;
    body: RequestBody;
    query?: QueryParams;
  };
  responses: {
    200: Output;
  };
}

export type RecursiveJSONSchema = {
  description?: string;
  type: string;
  const?: string;
  format?: string;
  properties?: {
    [key: string]: RecursiveJSONSchema;
  };
  items?: RecursiveJSONSchema;
  required?: string[];
};
import type { Prisma } from "/root/dev/svetch/node_modules/.prisma/client/index";

export interface APIPaths {
  "api.prisma.:id": {
    POST: {
      parameters: {
        body: {
          id?: string;
          email: string;
          name?: string;
          password: string;
          createdAt?: string | Date;
          updatedAt?: string | Date;
          posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
        };
        path: { id: string };
      };
      responses: {
        200: {
          posts: Array<{
            id: string;
            title: string;
            content: string;
            createdAt: Date;
            updatedAt: Date;
            authorId: string;
          }>;
          id: string;
          email: string;
          name: string;
          password: string;
          createdAt: Date;
          updatedAt: Date;
          uwu: { uwu: { uwu: { uwu: "owo" } } };
        };
      };
      errors?: never;
    };
    PATCH: {
      parameters: {
        body: {
          id?: string | { set?: string };
          email?: string | { set?: string };
          name?: string | { set?: string };
          password?: string | { set?: string };
          createdAt?: string | Date | { set?: string | Date };
          updatedAt?: string | Date | { set?: string | Date };
          posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
        };
        path: { id: string };
        query: { query: string; number: number };
      };
      responses: {
        200: {
          author: {
            id: string;
            email: string;
            name: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
          };
          id: string;
          title: string;
          content: string;
          createdAt: Date;
          updatedAt: Date;
          authorId: string;
          uwu: { uwu: { uwu: { uwu: "owo" } } };
        };
      };
      errors: {
        400: [
          {
            message: "Bad Request";
          }
        ];
        500: [
          {
            message: "Internal Server Error";
          }
        ];
      };
    };
  };
}

export interface ActionPaths {}
