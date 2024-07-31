import { Body, Controller, Response,Route, SuccessResponse } from "tsoa";
import { Post } from "tsoa";
import type { Prisma } from "H:/dev/svetch/node_modules/.prisma/client/index.js"
import { Patch } from "tsoa";
import { Query } from "tsoa";

        @Route("/api/prisma/:id")
        export class apiprismaidController extends Controller {
        
        @Post()@Response<{ posts: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]; } & { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; } & { uwu: { uwu: { uwu: { uwu: "owo"; }; }; }; }>(200)
@Response<{ posts: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]; } & { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; } & { uwu: { uwu: { uwu: { uwu: "owo"; }; }; }; }>(200)
public async post(
        @Path() id: string
,@Body() body: Prisma.UserCreateWithoutPostsInput
        ): Promise<void> {
                return;
            }
        @Patch()@Response<{ author: { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; }; } & { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }>(200)
@Response<unknown>(200)
@Response<({ author: { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; }; } & { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; })[]>(200)
@Response<string>(200)
@Response<{ owo: string; id: any; }>(200)
@Response<{ id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]>(200)
@Response<500>(200)
@Response<string>(200)
@Response<{ author: { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; }; } & { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }>(200)
@Response<"Not OK">(400)
public async patch(
        @Path() id: string
,@Body() body: Prisma.UserUpdateWithoutPostsInput
,@Query() query: string
,@Query() number: number
        ): Promise<void> {
                return;
            }
    }