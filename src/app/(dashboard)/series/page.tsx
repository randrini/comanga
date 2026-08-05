"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ui/data-table";
import { api } from "@/lib/trpc/react";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  RefreshCw,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function coverColorFromId(id: string): string {
  const colors = [
    "#e63946", "#1d3557", "#2a9d8f", "#e9c46a", "#264653",
    "#bc6c25", "#003049", "#6a4c93", "#d90429", "#f4a261",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SeriesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden">
          <Skeleton className="aspect-[3/4] rounded-none" />
          <div className="p-2.5 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SeriesListSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-8 w-6 rounded-sm shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
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
      // Sort by volume count descending as a proxy for progress
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
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-6 rounded-sm shrink-0"
            style={{ backgroundColor: coverColorFromId(row.id) }}
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
      className: "w-24",
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
        <span className="text-text-secondary text-xs">
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text-primary">Series</h1>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Series
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => {
              setLocalViewMode("grid");
              updateParams({ view: "grid" });
            }}
            className={`p-1.5 text-xs transition-colors ${
              localViewMode === "grid"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setLocalViewMode("list");
              updateParams({ view: "list" });
            }}
            className={`p-1.5 text-xs transition-colors ${
              localViewMode === "list"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
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
          className="h-7 px-2 text-xs bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-accent/50"
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
          className="h-7 px-2 text-xs bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-accent/50"
        >
          <option value="all">All Types</option>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
          <option value="comic">Comic</option>
          <option value="light_novel">Light Novel</option>
          <option value="novel">Novel</option>
        </select>

        <span className="text-xs text-text-muted ml-auto">
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
          <div className="h-16 w-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center mb-4">
            <RefreshCw className="h-6 w-6 text-text-muted" />
          </div>
          <h2 className="text-sm font-medium text-text-primary mb-1">
            Failed to load series
          </h2>
          <p className="text-xs text-text-muted mb-4 max-w-sm">
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-text-muted" />
          </div>
          <h2 className="text-sm font-medium text-text-primary mb-1">
            No series yet
          </h2>
          <p className="text-xs text-text-muted mb-4 max-w-sm">
            Add your first series to get started. Comanga will automatically
            monitor and download new releases.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Series
          </Link>
        </div>
      ) : localViewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {sorted.map((series) => (
            <Link key={series.id} href={`/series/${series.id}`}>
              <Card className="group cursor-pointer overflow-hidden">
                {/* Cover */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: coverColorFromId(series.id) }}
                >
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                      {series.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="default" className="!bg-black/60 !text-white !border-0">
                      {mediaTypeLabels[series.mediaType as MediaType] ?? series.mediaType}
                    </Badge>
                  </div>
                  {series.monitored ? (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-2 w-2 rounded-full bg-success" />
                    </div>
                  ) : null}
                </div>

                {/* Footer info */}
                <div className="px-2.5 py-2 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {series.volumeCount ?? 0} vols
                  </span>
                  <span className="text-xs text-text-muted">
                    {statusLabels[series.status ?? "unknown"]}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="border border-border rounded-lg overflow-hidden">
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
