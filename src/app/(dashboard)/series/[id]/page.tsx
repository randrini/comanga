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
  BookOpen,
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
      <Skeleton className="h-4 w-28 mb-5" />

      <div className="flex gap-5 mb-6">
        <Skeleton className="hidden sm:block w-36 h-48 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
          <Skeleton className="h-1.5 w-full max-w-xs rounded-full" />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="flex border-b border-border/50 mb-5 gap-1">
        {tabs.map((tab) => (
          <Skeleton key={tab.key} className="h-9 w-20" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
            <Skeleton className="aspect-[3/4] rounded-none" />
            <div className="p-3 space-y-2">
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

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Series
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            <AlertCircle className="h-7 w-7 text-text-muted" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1.5">
            Failed to load series
          </h2>
          <p className="text-sm text-text-muted mb-5 max-w-sm">
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <Link
            href="/series"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Series
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            <Search className="h-7 w-7 text-text-muted" />
          </div>
          <h2 className="text-base font-semibold text-text-primary mb-1.5">
            Series not found
          </h2>
          <p className="text-sm text-text-muted mb-5 max-w-sm">
            The series you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/series"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  const volumes = series.volumes ?? [];
  const chapters = series.chapters ?? [];
  const volumeCount = volumes.length;
  const chapterCount = chapters.length;
  const downloadedCount = 0;

  return (
    <div className="p-4 lg:p-6">
      {/* Back button */}
      <Link
        href="/series"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Series
      </Link>

      {/* Series header — hero section */}
      <div className="flex gap-5 mb-6">
        {/* Cover */}
        <div
          className="hidden sm:block w-36 h-48 rounded-xl shrink-0 relative overflow-hidden shadow-elevated"
          style={{ backgroundColor: coverColorFromId(series.id) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white/20" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text-primary mb-1.5">
            {series.title}
          </h1>
          {series.description && (
            <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
              {series.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-4">
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
          <div className="max-w-sm">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-muted">Download Progress</span>
              <span className="text-text-primary font-semibold tabular-nums">
                {downloadedCount}/{volumeCount} ({volumeCount > 0 ? Math.round((downloadedCount / volumeCount) * 100) : 0}%)
              </span>
            </div>
            <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500 relative"
                style={{
                  width: `${volumeCount > 0 ? Math.round((downloadedCount / volumeCount) * 100) : 0}%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all duration-200 shadow-glow">
          <Search className="h-3.5 w-3.5" />
          Search All
        </button>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-bg-surface border border-border/50 text-text-primary rounded-lg hover:bg-bg-hover transition-all duration-200">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metadata
        </button>
        <button
          onClick={() => setAutoMonitor(!autoMonitor)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border rounded-lg transition-all duration-200 ${
            autoMonitor
              ? "bg-success/10 border-success/20 text-success"
              : "bg-bg-surface border-border/50 text-text-secondary"
          }`}
        >
          {autoMonitor ? (
            <Bell className="h-3.5 w-3.5" />
          ) : (
            <BellOff className="h-3.5 w-3.5" />
          )}
          {autoMonitor ? "Auto Monitor" : "Monitor Off"}
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-bg-surface border border-border/50 text-text-primary rounded-lg hover:bg-bg-hover transition-all duration-200 ml-auto">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-xs font-semibold transition-colors duration-200 -mb-px ${
              activeTab === tab.key
                ? "text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "volumes" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
          {volumes.map((vol) => {
            const status = statusConfig.pending;
            return (
              <Card key={vol.id} className="group cursor-pointer overflow-hidden">
                {/* Volume cover */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: coverColorFromId(vol.id) }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="text-sm font-semibold text-white">
                      Vol. {vol.volumeNumber}
                    </div>
                    {vol.title && (
                      <div className="text-[11px] text-white/60 truncate mt-0.5">
                        {vol.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Volume info */}
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant={status.variant}>
                      <span className="flex items-center gap-1">
                        {status.icon}
                        {status.label}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
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
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-muted">
              <BookOpen className="h-8 w-8 mb-3 opacity-40" />
              <span className="text-sm">No volumes yet</span>
            </div>
          )}
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <BookOpen className="h-8 w-8 mb-3 opacity-40" />
          <span className="text-sm">
            {chapterCount > 0
              ? `${chapterCount} chapter${chapterCount !== 1 ? "s" : ""} available`
              : "Chapters view coming soon"}
          </span>
        </div>
      )}

      {activeTab === "downloads" && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Download className="h-8 w-8 mb-3 opacity-40" />
          <span className="text-sm">Download history for this series</span>
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Clock className="h-8 w-8 mb-3 opacity-40" />
          <span className="text-sm">Activity history for this series</span>
        </div>
      )}
    </div>
  );
}
