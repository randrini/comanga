"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ui/data-table";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";
import { api } from "@/lib/trpc/react";
import {
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import type { MediaType } from "@/lib/utils";

// ─── Labels ──────────────────────────────────────────────────────────────────

const mediaTypeLabels: Record<MediaType, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
  light_novel: "Light Novel",
  novel: "Novel",
};

const statusLabels: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
  unknown: "Unknown",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SeriesGridSkeleton() {
  return (
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
  );
}

function SeriesListSkeleton() {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div className="divide-y divide-border/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-9 w-7 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL search params
  const viewMode = (searchParams.get("view") as "grid" | "list") ?? "grid";
  const mediaFilter = (searchParams.get("mediaType") as MediaType | "all") ?? "all";
  const sortBy = (searchParams.get("sort") as "title" | "recent" | "progress") ?? "title";

  // Local state for select elements (synced to URL on change)
  const [localSort, setLocalSort] = useState(sortBy);
  const [localMediaFilter, setLocalMediaFilter] = useState(mediaFilter);
  const [localViewMode, setLocalViewMode] = useState(viewMode);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "all" || value === "title") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }

  // tRPC query
  const { data, isLoading, isError, error, refetch } = api.series.list.useQuery({
    mediaType: mediaFilter !== "all" ? mediaFilter : undefined,
    limit: 100,
    offset: 0,
  });

  // Sort client-side
  const sorted = useMemo(() => {
    if (!data?.items) return [];
    const items = [...data.items];
    if (sortBy === "title") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "recent") {
      items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    } else if (sortBy === "progress") {
      items.sort((a, b) => (b.volumeCount ?? 0) - (a.volumeCount ?? 0));
    }
    return items;
  }, [data, sortBy]);

  // ── Columns for list view ──────────────────────────────────────────────────

  const columns: Column<(typeof sorted)[number]>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <CoverPlaceholder
            title={row.title}
            seed={row.id}
            className="h-9 w-7 rounded-md shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {row.title}
            </div>
            <div className="text-xs text-text-muted">
              {row.yearStart ?? "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "mediaType",
      header: "Type",
      className: "w-28",
      render: (row) => (
        <Badge variant="default">
          {mediaTypeLabels[row.mediaType as MediaType] ?? row.mediaType}
        </Badge>
      ),
    },
    {
      key: "volumes",
      header: "Volumes",
      className: "w-20",
      render: (row) => (
        <span className="text-text-secondary text-xs tabular-nums">
          {row.volumeCount ?? 0}
        </span>
      ),
    },
    {
      key: "monitored",
      header: "Monitored",
      className: "w-24",
      render: (row) => (
        <Badge variant={row.monitored ? "success" : "default"}>
          {row.monitored ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "w-36",
      render: (row) => (
        <span className="text-text-muted text-xs">
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-text-primary">Series</h1>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200 shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Series
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border/50 overflow-hidden bg-bg-surface/50">
          <button
            onClick={() => {
              setLocalViewMode("grid");
              updateParams({ view: "grid" });
            }}
            className={`p-2 text-xs transition-all duration-200 ${
              localViewMode === "grid"
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover/50"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setLocalViewMode("list");
              updateParams({ view: "list" });
            }}
            className={`p-2 text-xs transition-all duration-200 ${
              localViewMode === "list"
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover/50"
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sort */}
        <select
          value={localSort}
          onChange={(e) => {
            const val = e.target.value as typeof sortBy;
            setLocalSort(val);
            updateParams({ sort: val });
          }}
          className="h-8 px-3 text-xs bg-bg-surface border border-border/50 rounded-lg text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200 cursor-pointer"
        >
          <option value="title">Sort: Title</option>
          <option value="recent">Sort: Recent</option>
          <option value="progress">Sort: Progress</option>
        </select>

        {/* Media type filter */}
        <select
          value={localMediaFilter}
          onChange={(e) => {
            const val = e.target.value as MediaType | "all";
            setLocalMediaFilter(val);
            updateParams({ mediaType: val });
          }}
          className="h-8 px-3 text-xs bg-bg-surface border border-border/50 rounded-lg text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
          <option value="comic">Comic</option>
          <option value="light_novel">Light Novel</option>
          <option value="novel">Novel</option>
        </select>

        <span className="text-xs text-text-muted ml-auto tabular-nums">
          {data?.total ?? 0} series
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        localViewMode === "grid" ? (
          <SeriesGridSkeleton />
        ) : (
          <SeriesListSkeleton />
        )
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            <RefreshCw className="h-7 w-7 text-text-muted" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1.5">
            Failed to load series
          </h2>
          <p className="text-sm text-text-muted mb-5 max-w-sm">
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            <BookOpen className="h-8 w-8 text-text-muted" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1.5">
            No series yet
          </h2>
          <p className="text-sm text-text-muted mb-5 max-w-sm">
            Add your first series to get started. Comanga will automatically
            monitor and download new releases.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200 shadow-glow"
          >
            <Plus className="h-4 w-4" />
            Add Your First Series
          </Link>
        </div>
      ) : localViewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 stagger-children">
          {sorted.map((series) => (
            <Link key={series.id} href={`/series/${series.id}`}>
              <Card className="group cursor-pointer overflow-hidden h-full">
                {/* Cover */}
                <div className="aspect-[3/4] relative">
                  <CoverPlaceholder
                    title={series.title}
                    mediaType={mediaTypeLabels[series.mediaType as MediaType] ?? series.mediaType}
                    seed={series.id}
                    className="absolute inset-0"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                      {series.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/50 text-white/90 backdrop-blur-sm">
                      {mediaTypeLabels[series.mediaType as MediaType] ?? series.mediaType}
                    </span>
                  </div>
                  {series.monitored ? (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="flex h-2 w-2 rounded-full bg-success shadow-[0_0_6px_#22c55e]" />
                    </div>
                  ) : null}
                </div>

                {/* Footer info */}
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted tabular-nums">
                    {series.volumeCount ?? 0} vols
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {statusLabels[series.status ?? "unknown"]}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={sorted}
            getRowKey={(row) => row.id}
            onRowClick={(row) => {
              router.push(`/series/${row.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
