"use client";

import { TRPCProvider } from "@/lib/trpc/client";
import type { ReactNode } from "react";

/**
 * Client-side providers wrapper.
 * Place this in the root layout to enable tRPC + React Query across the app.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
