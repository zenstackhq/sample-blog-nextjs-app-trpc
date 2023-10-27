import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createRouter } from "./routers/generated/routers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createRouter(createTRPCRouter, publicProcedure);

// export type definition of API
export type AppRouter = typeof appRouter;
