import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Creates the tRPC context for each request.
 * Injects the database instance and request object.
 */
export const createTRPCContext = (opts: { req: Request }) => {
  return { db, req: opts.req };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context typing and superjson transformer.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const publicProcedure = t.procedure;
export const router = t.router;

// ─── Placeholder Routers ───────────────────────────────────────────────────────

const seriesRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return null;
  }),
});

const downloadRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return null;
  }),
});

const metadataRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return null;
  }),
});

const settingsRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return null;
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  series: seriesRouter,
  download: downloadRouter,
  metadata: metadataRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
