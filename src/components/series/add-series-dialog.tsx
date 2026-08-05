"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  // Pre-fill from metadata when series changes
  useEffect(() => {
    if (series) {
      setTitle(series.title);
      setMediaType(series.mediaType);
    }
  }, [series]);

  // Close on Escape
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
    "w-full h-8 px-2.5 text-xs bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer";

  const inputClasses =
    "w-full h-8 px-2.5 text-xs bg-bg-primary border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Series</CardTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center gap-2 text-xs text-text-muted bg-bg-primary/50 rounded-md px-2.5 py-2 border border-border/50">
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
                className="flex-1 h-8 text-xs font-medium bg-bg-hover text-text-secondary rounded-md hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  "flex-1 h-8 text-xs font-medium rounded-md transition-colors",
                  title.trim()
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-accent/30 text-text-muted cursor-not-allowed",
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
