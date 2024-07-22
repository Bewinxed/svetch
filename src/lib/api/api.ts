
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


export interface APIPaths {
  'api.prisma': {
    POST: {
      parameters: {
        body: {  id?: string;
  email: string;
  name?: string;
  password: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  posts?: {  create?: (
  import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput> &
  import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput
) | (
  import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput> &
  import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput
) | Array<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput> | Array<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput>;
  connectOrCreate?: {  where: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereUniqueInput;
  create: (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput) | (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput);} | Array<{  where: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereUniqueInput;
  create: (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput) | (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostUncheckedCreateWithoutAuthorInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateWithoutAuthorInput);}>;
  createMany?: {  data: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateManyAuthorInput | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostCreateManyAuthorInput[];
  skipDuplicates?: boolean;};
  connect?: {
id: string;
id?: string; AND?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; OR?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; NOT?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; title?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; content?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; createdAt?: string | Date | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.DateTimeFilter<"Post">; updatedAt?: string | Date | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.DateTimeFilter<"Post">; authorId?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; author?: (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput) | (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter);
} | {
id: string;
id?: string; AND?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; OR?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; NOT?: import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereInput[]; title?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; content?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; createdAt?: string | Date | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.DateTimeFilter<"Post">; updatedAt?: string | Date | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.DateTimeFilter<"Post">; authorId?: string | import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.StringFilter<"Post">; author?: (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput) | (import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.Without<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserWhereInput, import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter> & import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.UserRelationFilter);
} | Array<import("/root/dev/svetch/node_modules/.prisma/client/index").Prisma.PostWhereUniqueInput>;};};
        path: {};
      },
      responses: {
    200: {
posts: Array<{  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;}>;
id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
  };
      errors?: never;
    };
  };
}
export interface ActionPaths {
};
