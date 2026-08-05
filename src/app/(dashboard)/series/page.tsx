"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { MediaType } from "@/lib/utils";

// ─── Mock data ───────────────────────────────────────────────────────────────

interface SeriesItem {
  id: string;
  title: string;
  mediaType: MediaType;
  volumes: number;
  downloaded: number;
  monitored: boolean;
  lastDownloaded: string | null;
  coverColor: string;
  year: number;
  status: "ongoing" | "completed" | "hiatus";
}

const mockSeries: SeriesItem[] = [
  {
    id: "1",
    title: "One Piece",
    mediaType: "manga",
    volumes: 110,
    downloaded: 110,
    monitored: true,
    lastDownloaded: "2026-08-04",
    coverColor: "#e63946",
    year: 1997,
    status: "ongoing",
  },
  {
    id: "2",
    title: "Berserk",
    mediaType: "manga",
    volumes: 42,
    downloaded: 38,
    monitored: true,
    lastDownloaded: "2026-07-28",
    coverColor: "#1d3557",
    year: 1989,
    status: "hiatus",
  },
  {
    id: "3",
    title: "Solo Leveling",
    mediaType: "manhwa",
    volumes: 14,
    downloaded: 14,
    monitored: false,
    lastDownloaded: "2026-06-15",
    coverColor: "#2a9d8f",
    year: 2018,
    status: "completed",
  },
  {
    id: "4",
    title: "Saga",
    mediaType: "comic",
    volumes: 11,
    downloaded: 9,
    monitored: true,
    lastDownloaded: "2026-08-01",
    coverColor: "#e9c46a",
    year: 2012,
    status: "ongoing",
  },
  {
    id: "5",
    title: "Mushoku Tensei",
    mediaType: "light_novel",
    volumes: 26,
    downloaded: 20,
    monitored: true,
    lastDownloaded: "2026-07-30",
    coverColor: "#264653",
    year: 2014,
    status: "ongoing",
  },
  {
    id: "6",
    title: "Vagabond",
    mediaType: "manga",
    volumes: 37,
    downloaded: 37,
    monitored: false,
    lastDownloaded: "2026-05-20",
    coverColor: "#bc6c25",
    year: 1998,
    status: "hiatus",
  },
  {
    id: "7",
    title: "Invincible",
    mediaType: "comic",
    volumes: 25,
    downloaded: 12,
    monitored: true,
    lastDownloaded: "2026-08-03",
    coverColor: "#003049",
    year: 2003,
    status: "completed",
  },
  {
    id: "8",
    title: "Overlord",
    mediaType: "light_novel",
    volumes: 16,
    downloaded: 16,
    monitored: true,
    lastDownloaded: "2026-07-15",
    coverColor: "#6a4c93",
    year: 2012,
    status: "ongoing",
  },
];

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
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mediaFilter, setMediaFilter] = useState<MediaType | "all">("all");
  const [sortBy, setSortBy] = useState<"title" | "recent" | "progress">(
    "title",
  );

  const filtered = mockSeries
    .filter((s) => mediaFilter === "all" || s.mediaType === mediaFilter)
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "recent")
        return (b.lastDownloaded ?? "").localeCompare(a.lastDownloaded ?? "");
      return b.downloaded / b.volumes - a.downloaded / a.volumes;
    });

  const columns: Column<SeriesItem>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-6 rounded-sm shrink-0"
            style={{ backgroundColor: row.coverColor }}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {row.title}
            </div>
            <div className="text-xs text-text-muted">{row.year}</div>
          </div>
        </div>
      ),
    },
    {
      key: "mediaType",
      header: "Type",
      className: "w-24",
      render: (row) => (
        <Badge variant="default">{mediaTypeLabels[row.mediaType]}</Badge>
      ),
    },
    {
      key: "volumes",
      header: "Volumes",
      className: "w-20",
      render: (row) => (
        <span className="text-text-secondary text-xs">
          {row.downloaded}/{row.volumes}
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
      key: "lastDownloaded",
      header: "Last Downloaded",
      className: "w-36",
      render: (row) => (
        <span className="text-text-muted text-xs">
          {row.lastDownloaded ?? "Never"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text-primary">Series</h1>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add Series
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 text-xs transition-colors ${
              viewMode === "grid"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 text-xs transition-colors ${
              viewMode === "list"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-7 px-2 text-xs bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-accent/50"
        >
          <option value="title">Sort: Title</option>
          <option value="recent">Sort: Recent</option>
          <option value="progress">Sort: Progress</option>
        </select>

        {/* Media type filter */}
        <select
          value={mediaFilter}
          onChange={(e) =>
            setMediaFilter(e.target.value as MediaType | "all")
          }
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
          {filtered.length} series
        </span>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
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
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
            <Plus className="h-4 w-4" />
            Add Your First Series
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filtered.map((series) => (
            <Link key={series.id} href={`/series/${series.id}`}>
              <Card className="group cursor-pointer overflow-hidden">
                {/* Cover */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: series.coverColor }}
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
                      {mediaTypeLabels[series.mediaType]}
                    </Badge>
                  </div>
                  {series.monitored && (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-2 w-2 rounded-full bg-success" />
                    </div>
                  )}
                </div>

                {/* Footer info */}
                <div className="px-2.5 py-2 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {series.downloaded}/{series.volumes} vols
                  </span>
                  <span className="text-xs text-text-muted">
                    {statusLabels[series.status]}
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
            data={filtered}
            getRowKey={(row) => row.id}
            onRowClick={(row) => {
              window.location.href = `/series/${row.id}`;
            }}
          />
        </div>
      )}
    </div>
  );
}
