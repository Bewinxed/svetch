import type { Prisma } from '@prisma/client';
export const POST = async ({ request }) => {
  const payload = {} as Prisma.UserCreateInput;

  type PrettifiedPayload = {
    [K in keyof Prisma.UserCreateInput]: Prisma.UserCreateInput[K];
  };

  const results = {} as Prisma.UserGetPayload<{
    include: {
      posts: true;
    };
  }>;
  return json(results);
};
