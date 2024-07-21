import { z } from 'zod';

export const schema = z.object({"H:dev/svetch/api/prisma":z.object({"POST":z.object({"parameters":z.object({"body":z.object({"id":z.string().optional(),"email":z.string().optional(),"name":z.string().optional(),"password":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional(),"posts":z.object({"create":z.union([z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()})),z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()})),z.array(z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()})),z.array(z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()}))]).optional(),"connectOrCreate":z.union([z.object({"where":z.any().optional(),"create":z.union([z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()})),z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()}))]).describe("XOR is needed to have a real mutually exclusive union type\nhttps://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types").optional()}),z.array(z.object({"where":z.any().optional(),"create":z.union([z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()})),z.intersection(z.any(),z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()}))]).describe("XOR is needed to have a real mutually exclusive union type\nhttps://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types").optional()}))]).optional(),"createMany":z.object({"data":z.union([z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()}),z.array(z.object({"id":z.string().optional(),"title":z.string().optional(),"content":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional()}))]).optional(),"skipDuplicates":z.boolean().optional()}).optional(),"connect":z.union([z.intersection(z.any(),z.object({"id":z.string().optional(),"AND":z.union([z.any(),z.array(z.any())]).optional(),"OR":z.array(z.any()).optional(),"NOT":z.union([z.any(),z.array(z.any())]).optional(),"title":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"content":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"createdAt":z.union([z.string().datetime(),z.object({"equals":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"lt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"lte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"not":z.union([z.string().datetime(),z.any(),z.string()]).optional()}),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.object({"equals":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"lt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"lte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"not":z.union([z.string().datetime(),z.any(),z.string()]).optional()}),z.string()]).optional(),"authorId":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"author":z.union([z.intersection(z.any(),z.any().describe("Deep Input Types")),z.intersection(z.any(),z.any())]).describe("XOR is needed to have a real mutually exclusive union type\nhttps://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types").optional()})),z.intersection(z.any(),z.object({"id":z.string().optional(),"AND":z.union([z.any(),z.array(z.any())]).optional(),"OR":z.array(z.any()).optional(),"NOT":z.union([z.any(),z.array(z.any())]).optional(),"title":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"content":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"createdAt":z.union([z.string().datetime(),z.object({"equals":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"lt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"lte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"not":z.union([z.string().datetime(),z.any(),z.string()]).optional()}),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.object({"equals":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.array(z.string().datetime()),z.any()]).optional(),"lt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"lte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gt":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"gte":z.union([z.string().datetime(),z.any(),z.string()]).optional(),"not":z.union([z.string().datetime(),z.any(),z.string()]).optional()}),z.string()]).optional(),"authorId":z.union([z.object({"equals":z.union([z.any(),z.string()]).optional(),"in":z.union([z.array(z.string()),z.any()]).optional(),"notIn":z.union([z.array(z.string()),z.any()]).optional(),"lt":z.union([z.any(),z.string()]).optional(),"lte":z.union([z.any(),z.string()]).optional(),"gt":z.union([z.any(),z.string()]).optional(),"gte":z.union([z.any(),z.string()]).optional(),"contains":z.union([z.any(),z.string()]).optional(),"startsWith":z.union([z.any(),z.string()]).optional(),"endsWith":z.union([z.any(),z.string()]).optional(),"mode":z.any().optional(),"not":z.union([z.any(),z.string()]).optional()}),z.string()]).optional(),"author":z.union([z.intersection(z.any(),z.any().describe("Deep Input Types")),z.intersection(z.any(),z.any())]).describe("XOR is needed to have a real mutually exclusive union type\nhttps://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types").optional()})),z.array(z.any())]).optional()}).optional()}).optional()}).optional(),"responses":z.object({"200":z.tuple([z.object({"typeString":z.literal("{\n  id: string;\n  email: string;\n  name: null | string;\n  password: string;\n  createdAt: {\n    \n  };\n  updatedAt: {\n    \n  };\n}").optional(),"imports":z.object({}).optional()})]).min(1).max(1).optional()}).optional()}).optional()}).optional()});