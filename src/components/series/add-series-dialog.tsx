"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";
import { X } from "lucide-react";
import type { MediaType, MonitorType } from "@/types";
import type { SearchResult } from "@/components/search/result-card";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AddSeriesInput {
  title: string;
  mediaType: MediaType;
  rootFolder: string;
  monitorType: MonitorType;
  metadataSource: string;
  metadataId: string;
}

interface AddSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: SearchResult | null;
  onAdd: (input: AddSeriesInput) => void;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
  light_novel: "Light Novel",
  novel: "Novel",
};

const MONITOR_LABELS: Record<MonitorType, string> = {
  all: "All chapters",
  new: "New chapters only",
  none: "None",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AddSeriesDialog({
  open,
  onOpenChange,
  series,
  onAdd,
}: AddSeriesDialogProps) {
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("manga");
  const [rootFolder, setRootFolder] = useState("/data/comanga/");
  const [monitorType, setMonitorType] = useState<MonitorType>("all");

  useEffect(() => {
    if (series) {
      setTitle(series.title);
      setMediaType(series.mediaType);
    }
  }, [series]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open || !series) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: title.trim(),
      mediaType,
      rootFolder: rootFolder.trim(),
      monitorType,
      metadataSource: series.source,
      metadataId: series.metadataId,
    });
  };

  const selectClasses =
    "w-full h-9 px-3 text-xs bg-bg-primary border border-border/50 rounded-lg text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200 appearance-none cursor-pointer";

  const inputClasses =
    "w-full h-9 px-3 text-xs bg-bg-primary border border-border/50 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-accent/20 animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Series</CardTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cover preview */}
            <div className="flex justify-center">
              <CoverPlaceholder
                title={title || series.title}
                mediaType={MEDIA_TYPE_LABELS[mediaType]}
                seed={series.metadataId}
                className="w-28 h-36 rounded-lg shadow-elevated"
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClasses}
                placeholder="Series title"
                autoFocus
              />
            </div>

            {/* Media type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Media Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className={selectClasses}
              >
                {(
                  Object.entries(MEDIA_TYPE_LABELS) as [MediaType, string][]
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Root folder */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Root Folder
              </label>
              <input
                type="text"
                value={rootFolder}
                onChange={(e) => setRootFolder(e.target.value)}
                className={inputClasses}
                placeholder="/data/comanga/"
              />
            </div>

            {/* Monitor type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Monitor
              </label>
              <select
                value={monitorType}
                onChange={(e) =>
                  setMonitorType(e.target.value as MonitorType)
                }
                className={selectClasses}
              >
                {(
                  Object.entries(MONITOR_LABELS) as [MonitorType, string][]
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Metadata source (read-only) */}
            <div className="flex items-center gap-2 text-xs text-text-muted bg-bg-primary/50 rounded-lg px-3 py-2.5 border border-border/30">
              <span className="text-text-secondary">Source:</span>
              <span className="text-text-primary font-medium capitalize">
                {series.source}
              </span>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px]">{series.metadataId}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9 text-xs font-medium bg-bg-hover text-text-secondary rounded-lg hover:text-text-primary hover:bg-bg-active transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  "flex-1 h-9 text-xs font-semibold rounded-lg transition-all duration-200",
                  title.trim()
                    ? "bg-accent text-text-inverse hover:bg-accent-hover active:scale-[0.98]"
                    : "bg-accent/20 text-text-muted cursor-not-allowed",
                )}
              >
                Add Series
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
