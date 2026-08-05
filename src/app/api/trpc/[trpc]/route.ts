import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@/lib/trpc/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError: ({ error, path }) => {
      console.error(
        `tRPC error on ${path ?? "(unknown)"}:`,
        error instanceof Error ? error.message : error,
      );
    },
  });

export const GET = handler;
export const POST = handler;
