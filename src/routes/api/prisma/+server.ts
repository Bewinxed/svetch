import type { Prisma } from '@prisma/client';
export const POST = async ({ request }) => {
  const payload = {} as Prisma.UserCreateInput;

  const results = {} as Prisma.UserGetPayload<object>;
  return json(results);
};
