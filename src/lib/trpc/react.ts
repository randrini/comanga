import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./server";

/**
 * tRPC React hooks proxy.
 * Use in client components: `api.series.list.useQuery()`
 */
export const api = createTRPCReact<AppRouter>();
