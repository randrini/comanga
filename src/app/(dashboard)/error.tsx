'use client';

import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
      <div className="h-16 w-16 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-2">
        <AlertCircle className="h-7 w-7 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-text-primary">Something went wrong</p>
      <p className="text-sm text-text-muted max-w-sm text-center">{error.message}</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
