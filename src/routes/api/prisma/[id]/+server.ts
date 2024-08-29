import type { Prisma } from "@prisma/client";
import type { Session } from "lucia";

/**
 * @tsoaModel
 */
type Document = {};
export const POST = async ({
	getClientAddress,
	locals,
	params,
	request,
	url
}) => {
	let session = await locals.auth.validate();

	const application = await prisma.application
		.findFirstOrThrow({
			include: {
				app_role: {
					orderBy: {
						created_at: 'asc'
					}
				},
				authentication_rule: {
					where: {
						provider: 'solana'
					}
				}
			},
			where: {
				id: params.app_id
			}
		})
		.catch(() => {
			throw error(
				404,
				'Application not found, Or Solana OAuth not enabled for this application'
			);
		});

	const state = url.searchParams.get('state');

	if (!state) {
		throw error(400, 'Missing state');
	}

	const payload = (await request.json()) as {
		input: SolanaSignInInput;
		output: SerializedSolanaSignInOutput;
	};

	const {
		output: {
			account: { publicKey: public_key },
			signature
		}
	} = payload;

	if (!public_key) {
		throw new Error('Invalid public key');
	}

	const authRequest = await verifyMessage(url, state, payload);

	const { access_token, access_token_expires_in, refresh_token } =
		await create_session_tokens({
			account_id: public_key,
			application,
			date: authRequest.created_at,
			proof: signature
		});

	let user: Prisma.UserGetPayload<{
		include: {
			key: true;
		};
	}> | null = null;

	try {
		if (session) {
			user = await handle_existing_session({
				application,
				provider: 'solana',
				provider_account_id: public_key,
				provider_user: {
					email: payload.output.account.address,
					id: public_key,
					image: payload.output.account.icon ?? '',
					name: payload.output.account.label ?? 'Unnamed'
				},
				session
			});
		} else {
			user = await handle_no_session({
				application,
				provider: 'solana',
				provider_account_id: public_key,
				provider_user: {
					email: payload.output.account.address,
					id: public_key,
					image: payload.output.account.icon ?? '',
					name: payload.output.account.label ?? 'Unnamed'
				}
			});
		}
	} catch (e) {
		if (e instanceof Error) {
			console.log(e);
			throw error(500, e.message);
		}
	}

	if (!user) {
		throw error(500, 'User not found nor created');
	}

	await prisma.authRequest.update({
		data: {
			access_token,
			access_token_expires_in,
			ip_address: getClientAddress(),
			provider_access_token: access_token,
			provider_refresh_token: refresh_token,
			refresh_token,
			signature,
			user_id: user.id
		},
		where: {
			id: authRequest.id
		}
	});

	session = await auth.createSession({
		attributes: {
			access_token,
			access_token_expires_in,
			application_id: authRequest?.application_id,
			auth_request_id: authRequest?.id,
			provider_account_id: public_key,
			refresh_token
		},
		userId: user.id
	});

	locals.auth.setSession(session);

	const results = session;

	return json(results);
};

/**
 * @tsoaModel
 */
type UnExportedType = {
	id: string;
	create: Prisma.UserGetPayload<object>;
};

export const PATCH = async ({ request, params, url }) => {
	const id = params.id as string;
	const string_param = url.searchParams.get("query") as string;
	const number_param = url.searchParams.get("number") as number;
	const payload = {} as Prisma.UserUpdateWithoutPostsInput;

	const results = {} as Prisma.PostGetPayload<{
		include: {
			author: true;
		};
	}>;

	if (ree) {
		return new Response({} as UnExportedType);
	}

	if (blah) {
		const posts = [] as Prisma.PostGetPayload<{
			include: {
				author: true;
			};
		}>[];
		return json(posts);
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
			JSON.stringify(sessions as Prisma.PostGetPayload<object>[], (_, value) =>
				typeof value === "bigint" ? value.toString() : value,
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

	if (lucia) {
		const session = {} as Session;
		return json(session.userId);
	}
	return json(results);
};

export const GET = async ({ params, url }) => {
	const id = params.id as string;
	const string_param = url.searchParams.get("query") as string;
	const number_param = url.searchParams.get("number") as number;

	return json();
};
