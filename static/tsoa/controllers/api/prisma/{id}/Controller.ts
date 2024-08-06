import { Body, Controller, Response,Route, SuccessResponse } from "tsoa";
import { Post } from "tsoa";
import { Patch } from "tsoa";
import { Query } from "tsoa";
import { Get } from "tsoa";

        @Route("/api/prisma/:id")
        export class apiprismaidController extends Controller{
        @Post()public async post(
        @Path() id: string
        ) {
                return ({} as { posts: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; }[]; } & { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; } & { uwu: { uwu: { uwu: { uwu: "owo"; }; }; }; });
            }
        @Patch()public async patch(
        @Path() id: string
,@Query() number: [object Object]
        ) {
                return ({} as ({ author: { id: string; email: string; name: string | null; password: string; createdAt: Date; updatedAt: Date; }; } & { id: string; title: string; content: string; createdAt: Date; updatedAt: Date; authorId: string; })[]);
            }
        @Get()public async get(
        @Path() id: string
,@Query() number: [object Object]
        ) {
                return ;
            }}

