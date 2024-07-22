import type { Prisma } from '@prisma/client';
export const POST = async ({ request }) => {
  const payload = {} as Prisma.UserCreateInput;

  const results = {} as Prisma.UserGetPayload<{
    include: {
      posts: true;
    };
  }>;
  return json(results);
};
