import { Body, Controller, Response,Route, SuccessResponse } from "tsoa";
import { Post } from "tsoa";
import { Patch } from "tsoa";
import type { Session } from "/Users/bewinxed/Development/svetch/node_modules/lucia/dist/core.js"
import { Query } from "tsoa";
import { Get } from "tsoa";

        @Route("/api/prisma/:id")
        export class apiprismaidController extends Controller{
        @Post()public async post(
        @Path() id: string
,@Body() body: { posts: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]; } & { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; } & { uwu: { uwu: { uwu: { uwu: "owo"; }; }; }; }
        ) {
                return ({} as { posts: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]; } & { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; } & { uwu: { uwu: { uwu: { uwu: "owo"; }; }; }; });
            }
        @Patch()@Response<"Not OK">(400)
public async patch(
        @Path() id: string
,@Body() body: Session
,@Query() number: [object Object]
        ) {
                return ({} as unknown);
            }
        @Get()public async get(
        @Path() id: string
,@Query() number: [object Object]
        ) {
                return ;
            }}
