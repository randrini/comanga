"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/trpc/react";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Bell,
  BellOff,
  Settings,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { DownloadStatus, MediaType } from "@/lib/utils";

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

const statusConfig: Record<
  DownloadStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "pending" | "default"; icon: React.ReactNode }
> = {
  completed: {
    label: "Downloaded",
    variant: "success",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  downloading: {
    label: "Downloading",
    variant: "info",
    icon: <Download className="h-3 w-3" />,
  },
  pending: {
    label: "Pending",
    variant: "pending",
    icon: <Clock className="h-3 w-3" />,
  },
  queued: {
    label: "Queued",
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
  },
  failed: {
    label: "Failed",
    variant: "danger",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  searching: {
    label: "Searching",
    variant: "info",
    icon: <Search className="h-3 w-3" />,
  },
  verifying: {
    label: "Verifying",
    variant: "warning",
    icon: <RefreshCw className="h-3 w-3" />,
  },
  importing: {
    label: "Importing",
    variant: "pending",
    icon: <Download className="h-3 w-3" />,
  },
  awaiting_release: {
    label: "Awaiting",
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
  },
  stalled: {
    label: "Stalled",
    variant: "warning",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  blocked: {
    label: "Blocked",
    variant: "danger",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  manual_search: {
    label: "Manual",
    variant: "warning",
    icon: <Search className="h-3 w-3" />,
  },
};

type Tab = "volumes" | "chapters" | "downloads" | "history";

const tabs: { key: Tab; label: string }[] = [
  { key: "volumes", label: "Volumes" },
  { key: "chapters", label: "Chapters" },
  { key: "downloads", label: "Downloads" },
  { key: "history", label: "History" },
];

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

function DetailSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      {/* Back link skeleton */}
      <Skeleton className="h-4 w-28 mb-4" />

      {/* Header skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="hidden sm:block w-32 h-44 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full max-w-xs" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-border mb-4 gap-1">
        {tabs.map((tab) => (
          <Skeleton key={tab.key} className="h-8 w-20" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <Skeleton className="aspect-[3/4] rounded-none" />
            <div className="p-2.5 space-y-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [activeTab, setActiveTab] = useState<Tab>("volumes");
  const [autoMonitor, setAutoMonitor] = useState(true);

  const { data: series, isLoading, isError, error } = api.series.getById.useQuery(id);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return <DetailSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Series
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-text-muted" />
          </div>
          <h2 className="text-sm font-medium text-text-primary mb-1">
            Failed to load series
          </h2>
          <p className="text-xs text-text-muted mb-4 max-w-sm">
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <Link
            href="/series"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (!series) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Series
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-text-muted" />
          </div>
          <h2 className="text-sm font-medium text-text-primary mb-1">
            Series not found
          </h2>
          <p className="text-xs text-text-muted mb-4 max-w-sm">
            The series you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/series"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const volumes = series.volumes ?? [];
  const chapters = series.chapters ?? [];
  const volumeCount = volumes.length;
  const chapterCount = chapters.length;
  const downloadedCount = 0; // TODO: compute from download status when wired

  return (
    <div className="p-4 lg:p-6">
      {/* Back button */}
      <Link
        href="/series"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Series
      </Link>

      {/* Series header */}
      <div className="flex gap-4 mb-6">
        {/* Cover */}
        <div
          className="hidden sm:block w-32 h-44 rounded-lg shrink-0"
          style={{ backgroundColor: coverColorFromId(series.id) }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary mb-1">
            {series.title}
          </h1>
          {series.description && (
            <p className="text-xs text-text-secondary mb-3 line-clamp-2">
              {series.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="default">
              {mediaTypeLabels[series.mediaType as MediaType] ?? series.mediaType}
            </Badge>
            <Badge variant="success">
              {statusLabels[series.status ?? "unknown"]}
            </Badge>
            {series.yearStart && (
              <span className="text-xs text-text-muted">{series.yearStart}</span>
            )}
            <span className="text-xs text-text-muted">
              {volumeCount} Volume{volumeCount !== 1 ? "s" : ""}
            </span>
            {series.metadataSource && (
              <span className="text-xs text-text-muted capitalize">
                {series.metadataSource}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-muted">Download Progress</span>
              <span className="text-text-primary font-medium">
                {downloadedCount}/{volumeCount} ({volumeCount > 0 ? Math.round((downloadedCount / volumeCount) * 100) : 0}%)
              </span>
            </div>
            <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{
                  width: `${volumeCount > 0 ? Math.round((downloadedCount / volumeCount) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
          <Search className="h-3.5 w-3.5" />
          Search All
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-secondary border border-border text-text-primary rounded-md hover:bg-bg-hover transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metadata
        </button>
        <button
          onClick={() => setAutoMonitor(!autoMonitor)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
            autoMonitor
              ? "bg-success/10 border-success/30 text-success"
              : "bg-bg-secondary border-border text-text-secondary"
          }`}
        >
          {autoMonitor ? (
            <Bell className="h-3.5 w-3.5" />
          ) : (
            <BellOff className="h-3.5 w-3.5" />
          )}
          {autoMonitor ? "Auto Monitor" : "Monitor Off"}
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-secondary border border-border text-text-primary rounded-md hover:bg-bg-hover transition-colors ml-auto">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "volumes" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {volumes.map((vol) => {
            // Volumes don't have a download status yet — default to pending
            const status = statusConfig.pending;
            return (
              <Card key={vol.id} className="group cursor-pointer overflow-hidden">
                {/* Volume cover */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: coverColorFromId(vol.id) }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs font-semibold text-white">
                      Vol. {vol.volumeNumber}
                    </div>
                    {vol.title && (
                      <div className="text-[10px] text-white/70 truncate">
                        {vol.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Volume info */}
                <div className="px-2.5 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={status.variant}>
                      <span className="flex items-center gap-1">
                        {status.icon}
                        {status.label}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>
                      {vol.releasedAt
                        ? new Date(vol.releasedAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
          {volumes.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-16 text-text-muted text-sm">
              No volumes yet
            </div>
          )}
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          {chapterCount > 0
            ? `${chapterCount} chapter${chapterCount !== 1 ? "s" : ""} available`
            : "Chapters view coming soon"}
        </div>
      )}

      {activeTab === "downloads" && (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          Download history for this series
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          Activity history for this series
        </div>
      )}
    </div>
  );
}
