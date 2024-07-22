import { z } from 'zod';

export const schema = z.object({"api.prisma":z.object({"POST":z.object({"parameters":z.object({"body":z.literal("{\"imports\":{}}").optional()}).optional(),"responses":z.object({"200":z.any().optional()}).optional()}).optional()}).optional()});