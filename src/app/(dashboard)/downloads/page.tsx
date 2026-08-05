"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Pause,
  Play,
  Trash2,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { DownloadStatus } from "@/lib/utils";

// ─── Mock data ───────────────────────────────────────────────────────────────

interface DownloadItem {
  id: string;
  name: string;
  series: string;
  downloader: string;
  progress: number;
  speed: string;
  eta: string;
  status: DownloadStatus;
  size: string;
  downloaded: string;
}

const mockDownloads: DownloadItem[] = [
  {
    id: "d1",
    name: "One Piece Vol. 110",
    series: "One Piece",
    downloader: "GetComics",
    progress: 78,
    speed: "12.4 MB/s",
    eta: "00:00:42",
    status: "downloading",
    size: "156 MB",
    downloaded: "122 MB",
  },
  {
    id: "d2",
    name: "Berserk Vol. 42",
    series: "Berserk",
    downloader: "slskd",
    progress: 45,
    speed: "3.2 MB/s",
    eta: "00:05:18",
    status: "downloading",
    size: "89 MB",
    downloaded: "40 MB",
  },
  {
    id: "d3",
    name: "Saga Vol. 12",
    series: "Saga",
    downloader: "Prowlarr",
    progress: 0,
    speed: "-",
    eta: "-",
    status: "pending",
    size: "210 MB",
    downloaded: "0 B",
  },
  {
    id: "d4",
    name: "Solo Leveling Vol. 8",
    series: "Solo Leveling",
    downloader: "ComicsCode",
    progress: 100,
    speed: "-",
    eta: "-",
    status: "completed",
    size: "67 MB",
    downloaded: "67 MB",
  },
  {
    id: "d5",
    name: "Mushoku Tensei Vol. 26",
    series: "Mushoku Tensei",
    downloader: "slskd",
    progress: 0,
    speed: "-",
    eta: "-",
    status: "queued",
    size: "45 MB",
    downloaded: "0 B",
  },
  {
    id: "d6",
    name: "Invincible Vol. 13",
    series: "Invincible",
    downloader: "GetComics",
    progress: 22,
    speed: "0 B/s",
    eta: "-",
    status: "stalled",
    size: "134 MB",
    downloaded: "30 MB",
  },
  {
    id: "d7",
    name: "Vagabond Vol. 37",
    series: "Vagabond",
    downloader: "Prowlarr",
    progress: 0,
    speed: "-",
    eta: "-",
    status: "failed",
    size: "92 MB",
    downloaded: "0 B",
  },
];

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function DownloadsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered = mockDownloads.filter((d) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "downloading")
      return d.status === "downloading" || d.status === "stalled";
    if (activeFilter === "queued")
      return d.status === "pending" || d.status === "queued";
    return d.status === activeFilter;
  });

  const columns: Column<DownloadItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {row.name}
          </div>
          <div className="text-xs text-text-muted">{row.series}</div>
        </div>
      ),
    },
    {
      key: "downloader",
      header: "Downloader",
      className: "w-28",
      render: (row) => (
        <span className="text-xs text-text-secondary">{row.downloader}</span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      className: "w-40",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-primary font-medium tabular-nums">
              {row.progress}%
            </span>
            <span className="text-text-muted">
              {row.downloaded} / {row.size}
            </span>
          </div>
          <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                row.status === "failed"
                  ? "bg-danger"
                  : row.status === "stalled"
                    ? "bg-warning"
                    : row.status === "completed"
                      ? "bg-success"
                      : "bg-accent"
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "speed",
      header: "Speed",
      className: "w-24",
      render: (row) => (
        <span className="text-xs text-text-secondary tabular-nums">
          {row.speed}
        </span>
      ),
    },
    {
      key: "eta",
      header: "ETA",
      className: "w-24",
      render: (row) => (
        <span className="text-xs text-text-secondary tabular-nums">
          {row.eta}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (row) => {
        const cfg = statusConfig[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === "downloading" && (
            <button className="p-1 rounded text-text-muted hover:text-warning hover:bg-bg-hover transition-colors">
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {(row.status === "pending" || row.status === "queued" || row.status === "stalled") && (
            <button className="p-1 rounded text-text-muted hover:text-success hover:bg-bg-hover transition-colors">
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="p-1 rounded text-text-muted hover:text-danger hover:bg-bg-hover transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text-primary">Downloads</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-bg-secondary border border-border text-text-primary rounded-md hover:bg-bg-hover transition-colors">
            <Pause className="h-3 w-3" />
            Pause All
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-bg-secondary border border-border text-text-primary rounded-md hover:bg-bg-hover transition-colors">
            <Play className="h-3 w-3" />
            Resume All
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-bg-secondary border border-border text-text-muted rounded-md hover:text-danger hover:border-danger/30 transition-colors">
            <Trash2 className="h-3 w-3" />
            Clear Completed
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border mb-4">
        {filterTabs.map((tab) => {
          const count =
            tab.key === "all"
              ? mockDownloads.length
              : tab.key === "downloading"
                ? mockDownloads.filter(
                    (d) => d.status === "downloading" || d.status === "stalled",
                  ).length
                : tab.key === "queued"
                  ? mockDownloads.filter(
                      (d) => d.status === "pending" || d.status === "queued",
                    ).length
                  : mockDownloads.filter((d) => d.status === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                activeFilter === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full ${
                  activeFilter === tab.key
                    ? "bg-accent/20"
                    : "bg-bg-hover"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(row) => row.id}
          emptyMessage="No downloads found."
        />
      </div>
    </div>
  );
}
