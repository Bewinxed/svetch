
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
    description?: string
    type: string
    const?: string
    format?: string
    properties?: {
        [key: string]: RecursiveJSONSchema
    }
    items?: RecursiveJSONSchema
    required?: string[]
}
import { Prisma } from "H:/dev/svetch/node_modules/.prisma/client/index";

export interface APIPaths {
  'H:dev/svetch/api/prisma': {
    POST: {
      parameters: { body: Prisma.UserCreateInput },
      responses: {
        200: [{"typeString":"{\n  id: string;\n  email: string;\n  name: null | string;\n  password: string;\n  createdAt: {\n    \n  };\n  updatedAt: {\n    \n  };\n}","imports":{}}],
      },
    },
  },
};
export interface ActionPaths {
  'dev/svetch/src/routes': {
    ACTION: {
      parameters: {
        path?: never,
        query?: never,
        body: { age: number | undefined; gender: string | undefined; height: number | undefined; weight: number | undefined; activityLevel: string | undefined; goal: string | undefined; goalWeight: number | undefined; allergies: { createMany: { data: { name: string; }[]; }; }; comorbidities: { createMany: { data: { name: string; }[]; }; }; },
      },
      responses: {
        200: [],
        401: [{
          typeString: {"name":"string"},
          imports: never,
        }, {
          typeString: {"status":"200","body":"{ message: string; }"},
          imports: never,
        }],
      }
      errors: {
        401: [{
          message: {
          typeString: "You're not logged in",
          imports: never,
        },
        }],
      }
    },
  },
};
