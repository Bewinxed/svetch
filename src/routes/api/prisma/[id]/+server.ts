import type { Prisma } from "@prisma/client";
import { json } from "stream/consumers";
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
	}>;

	if (ree) {
		return new Response("hi");
	}

	if (blah) {
		return json(
			results as {
				uwu: {
					owo: "uwu";
				};
			},
		);
	}

	if (a) {
		return new Response(`${url}${params ? `&${params.toString()}` : ""}`, {
			headers: {
				"content-type": "text/plain",
			},
		});
	}

	if (obj) {
		return json({
			owo: "what's this?",
			id: params.id,
		});
	}

	if (json) {
		return new Response(
			JSON.stringify(
				sessions as Prisma.SessionGetPayload<object>,
				(_, value) => (typeof value === "bigint" ? value.toString() : value),
			),
		);
	}

	if (notok) {
		return new Response("Not OK", {
			status: 400,
		});
	}

	if (nah) {
		throw error(400, "Bad Request");
	} else if (blah) {
		return error(500, "Internal Server Error");
	}
	return json(results);
};
