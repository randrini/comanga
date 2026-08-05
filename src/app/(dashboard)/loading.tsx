import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Content skeleton — grid of cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-bg-surface">
            <Skeleton className="aspect-[3/4] rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
