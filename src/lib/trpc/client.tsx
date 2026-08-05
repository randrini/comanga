import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";
import { useState, type ReactNode } from "react";
import { api } from "./react";
import type { AppRouter } from "./server";

/**
 * Standalone tRPC client (no React hooks).
 * Useful in non-component contexts like server actions or utilities.
 */
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});

/**
 * Creates a QueryClient with sensible defaults.
 * - staleTime: 60s — data is fresh for one minute
 * - No retry on 4xx client errors
 */
export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // Don't retry on 4xx client errors
          if (
            error instanceof Error &&
            "status" in error &&
            typeof (error as { status: unknown }).status === "number" &&
            (error as { status: number }).status >= 400 &&
            (error as { status: number }).status < 500
          ) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
}

/**
 * Root provider for tRPC + React Query.
 * Wraps children with the tRPC provider (which internally uses QueryClientProvider).
 */
export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <api.Provider
      queryClient={queryClient}
      client={api.createClient({
        links: [
          httpBatchLink({
            url: "/api/trpc",
            transformer: superjson,
          }),
        ],
      })}
    >
      {children}
    </api.Provider>
  );
}
