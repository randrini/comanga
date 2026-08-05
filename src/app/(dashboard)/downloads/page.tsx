"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ui/data-table";
import { api } from "@/lib/trpc/react";
import {
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Download,
} from "lucide-react";
import type { DownloadStatus } from "@/lib/utils";

// ─── Labels ──────────────────────────────────────────────────────────────────

type FilterTab = "all" | "downloading" | "queued" | "completed" | "failed";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "downloading", label: "Downloading" },
  { key: "queued", label: "Queued" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

const statusConfig: Record<
  DownloadStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "pending" | "default" }
> = {
  completed: { label: "Completed", variant: "success" },
  downloading: { label: "Downloading", variant: "info" },
  pending: { label: "Pending", variant: "pending" },
  queued: { label: "Queued", variant: "default" },
  failed: { label: "Failed", variant: "danger" },
  stalled: { label: "Stalled", variant: "warning" },
  searching: { label: "Searching", variant: "info" },
  verifying: { label: "Verifying", variant: "warning" },
  importing: { label: "Importing", variant: "pending" },
  awaiting_release: { label: "Awaiting", variant: "default" },
  blocked: { label: "Blocked", variant: "danger" },
  manual_search: { label: "Manual", variant: "warning" },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-4 w-20 rounded-md" />
      <div className="w-40 space-y-1.5">
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <Skeleton className="h-4 w-16 rounded-md" />
      <Skeleton className="h-4 w-16 rounded-md" />
      <Skeleton className="h-5 w-20 rounded-md" />
      <Skeleton className="h-4 w-16 rounded-md" />
    </div>
  );
}

function DownloadsTableSkeleton() {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div className="divide-y divide-border/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DownloadsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data, isLoading, isError, error, refetch } = api.download.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((d) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "downloading")
        return d.status === "downloading" || d.status === "stalled";
      if (activeFilter === "queued")
        return d.status === "pending" || d.status === "queued";
      return d.status === activeFilter;
    });
  }, [data, activeFilter]);

  const counts = useMemo(() => {
    if (!data?.items) return { all: 0, downloading: 0, queued: 0, completed: 0, failed: 0 };
    const items = data.items;
    return {
      all: items.length,
      downloading: items.filter((d) => d.status === "downloading" || d.status === "stalled").length,
      queued: items.filter((d) => d.status === "pending" || d.status === "queued").length,
      completed: items.filter((d) => d.status === "completed").length,
      failed: items.filter((d) => d.status === "failed").length,
    };
  }, [data]);

  const columns: Column<(typeof filtered)[number]>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {row.volumeId ?? row.chapterId ?? row.id}
          </div>
          <div className="text-xs text-text-muted">{row.seriesId}</div>
        </div>
      ),
    },
    {
      key: "downloader",
      header: "Downloader",
      className: "w-28",
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.downloaderType}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      className: "w-44",
      render: (row) => {
        const progress = row.progress ?? 0;
        const fileSize = row.fileSize
          ? `${(row.fileSize / 1024 / 1024).toFixed(0)} MB`
          : "—";
        const isActive = row.status === "downloading";
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-primary font-semibold tabular-nums">
                {progress}%
              </span>
              <span className="text-text-muted tabular-nums">{fileSize}</span>
            </div>
            <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 relative ${
                  row.status === "failed"
                    ? "bg-danger"
                    : row.status === "stalled"
                      ? "bg-warning"
                      : row.status === "completed"
                        ? "bg-success"
                        : "bg-accent"
                }`}
                style={{ width: `${progress}%` }}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "speed",
      header: "Speed",
      className: "w-24",
      render: () => (
        <span className="text-xs text-text-secondary tabular-nums">—</span>
      ),
    },
    {
      key: "eta",
      header: "ETA",
      className: "w-24",
      render: () => (
        <span className="text-xs text-text-secondary tabular-nums">—</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (row) => {
        const cfg = statusConfig[row.status as DownloadStatus] ?? statusConfig.pending;
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {row.status === "downloading" && (
            <button className="p-1.5 rounded-lg text-text-muted hover:text-warning hover:bg-warning/10 transition-all duration-200">
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {(row.status === "pending" || row.status === "queued" || row.status === "stalled") && (
            <button className="p-1.5 rounded-lg text-text-muted hover:text-success hover:bg-success/10 transition-all duration-200">
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-text-primary">Downloads</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-surface border border-border/50 text-text-primary rounded-lg hover:bg-bg-hover transition-all duration-200">
            <Pause className="h-3 w-3" />
            Pause All
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-surface border border-border/50 text-text-primary rounded-lg hover:bg-bg-hover transition-all duration-200">
            <Play className="h-3 w-3" />
            Resume All
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-surface border border-border/50 text-text-muted rounded-lg hover:text-danger hover:border-danger/20 transition-all duration-200">
            <Trash2 className="h-3 w-3" />
            Clear Completed
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border/50 mb-5">
        {filterTabs.map((tab) => {
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative px-4 py-2.5 text-xs font-semibold transition-colors duration-200 -mb-px flex items-center gap-2 ${
                activeFilter === tab.key
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                  activeFilter === tab.key
                    ? "bg-accent/15 text-accent"
                    : "bg-bg-hover text-text-muted"
                }`}
              >
                {count}
              </span>
              {activeFilter === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <DownloadsTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            <RefreshCw className="h-7 w-7 text-text-muted" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1.5">
            Failed to load downloads
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
      ) : filtered.length === 0 ? (
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Download className="h-8 w-8 mb-3 opacity-40" />
            <span className="text-sm">No downloads</span>
          </div>
        </div>
      ) : (
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={filtered}
            getRowKey={(row) => row.id}
            emptyMessage="No downloads found."
          />
        </div>
      )}
    </div>
  );
}
