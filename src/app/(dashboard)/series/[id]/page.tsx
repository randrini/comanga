"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

// ─── Mock data ───────────────────────────────────────────────────────────────

interface VolumeItem {
  id: string;
  number: number;
  title: string;
  coverColor: string;
  status: DownloadStatus;
  pages: number;
  size: string;
  downloadedAt: string | null;
}

const mockVolumes: VolumeItem[] = [
  {
    id: "v1",
    number: 1,
    title: "Romance Dawn",
    coverColor: "#e63946",
    status: "completed",
    pages: 208,
    size: "42 MB",
    downloadedAt: "2026-08-04",
  },
  {
    id: "v2",
    number: 2,
    title: "Buggy the Clown",
    coverColor: "#f4a261",
    status: "completed",
    pages: 200,
    size: "38 MB",
    downloadedAt: "2026-08-03",
  },
  {
    id: "v3",
    number: 3,
    title: "Don't Get Fooled Again",
    coverColor: "#2a9d8f",
    status: "completed",
    pages: 192,
    size: "36 MB",
    downloadedAt: "2026-08-02",
  },
  {
    id: "v4",
    number: 4,
    title: "The Black Cat Pirates",
    coverColor: "#264653",
    status: "downloading",
    pages: 200,
    size: "40 MB",
    downloadedAt: null,
  },
  {
    id: "v5",
    number: 5,
    title: "For Whom the Bell Tolls",
    coverColor: "#6a4c93",
    status: "pending",
    pages: 196,
    size: "37 MB",
    downloadedAt: null,
  },
];

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function SeriesDetailPage() {
  const [activeTab, setActiveTab] = useState<Tab>("volumes");
  const [autoMonitor, setAutoMonitor] = useState(true);

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
          style={{ backgroundColor: "#e63946" }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary mb-1">
            One Piece
          </h1>
          <p className="text-xs text-text-secondary mb-3 line-clamp-2">
            Monkey D. Luffy sets off on an adventure with his pirate crew in
            hopes of finding the greatest treasure ever, known as the &quot;One Piece.&quot;
          </p>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="default">Manga</Badge>
            <Badge variant="success">Ongoing</Badge>
            <span className="text-xs text-text-muted">1997</span>
            <span className="text-xs text-text-muted">110 Volumes</span>
            <span className="text-xs text-text-muted">Shueisha</span>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-muted">Download Progress</span>
              <span className="text-text-primary font-medium">
                110/110 (100%)
              </span>
            </div>
            <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full w-full" />
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
          {mockVolumes.map((vol) => {
            const status = statusConfig[vol.status];
            return (
              <Card key={vol.id} className="group cursor-pointer overflow-hidden">
                {/* Volume cover */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: vol.coverColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs font-semibold text-white">
                      Vol. {vol.number}
                    </div>
                    <div className="text-[10px] text-white/70 truncate">
                      {vol.title}
                    </div>
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
                    <span>{vol.pages} pages</span>
                    <span>{vol.size}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          Chapters view coming soon
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
