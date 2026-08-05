'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-text-secondary">Something went wrong</p>
      <p className="text-sm text-text-muted">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 rounded-md bg-accent text-white text-sm">Try again</button>
    </div>
  );
}
