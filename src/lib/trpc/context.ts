import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

/**
 * Creates the tRPC context for each request.
 * Injects the database instance, request object, and NextAuth session.
 */
export const createTRPCContext = async (opts: { req: Request }) => {
  const session = await getServerSession(authOptions);
  return { db, req: opts.req, session };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
