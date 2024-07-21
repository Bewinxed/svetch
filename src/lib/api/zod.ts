import { z } from 'zod';

export const schema = z.object({"api/prisma":z.object({"POST":z.object({"parameters":z.object({"body":z.object({"id":z.string().optional(),"email":z.string().optional(),"name":z.string().optional(),"password":z.string().optional(),"createdAt":z.union([z.string().datetime(),z.string()]).optional(),"updatedAt":z.union([z.string().datetime(),z.string()]).optional(),"posts":z.object({}).optional()}).optional()}).optional(),"responses":z.object({"200":z.object({"id":z.string().optional(),"email":z.string().optional(),"name":z.string().optional(),"password":z.string().optional(),"createdAt":z.string().datetime().optional(),"updatedAt":z.string().datetime().optional()}).optional()}).optional()}).optional()}).optional()});