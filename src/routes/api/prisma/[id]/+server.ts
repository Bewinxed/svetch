import type { Prisma } from "@prisma/client";
export const POST = async ({ request }) => {
  const payload = {} as Prisma.UserCreateInput;

  type PrettifiedPayload = {
    [K in keyof Prisma.UserCreateInput]: Prisma.UserCreateInput[K];
  };

  const results = {} as Prisma.UserGetPayload<{
    include: {
      posts: true;
    };
  }> & {
    uwu: {
      uwu: {
        uwu: {
          uwu: "owo";
        };
      };
    };
  };
  return json(results);
};

export const PATCH = async ({ request, params, url }) => {
  const id = params.id as string;
  const string_param = url.searchParams.get("query") as string;
  const number_param = url.searchParams.get("number") as number;
  const payload = {} as Prisma.UserUpdateInput;

  const results = {} as Prisma.PostGetPayload<{
    include: {
      author: true;
    };
  }> & {
    uwu: {
      uwu: {
        uwu: {
          uwu: "owo";
        };
      };
    };
  };

  if (blah) {
    const;
    return json(
      results as {
        uwu: {
          owo: "uwu";
        };
      }
    );
  }

  if (nah) {
    throw error(400, "Bad Request");
  } else if (blah) {
    throw error(500, "Internal Server Error");
  }
  return json(results);
};
