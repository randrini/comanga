"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CoverPlaceholder } from "@/components/ui/cover-placeholder";
import { Plus, Check } from "lucide-react";
import type { MediaType, MetadataSource, SeriesStatus } from "@/types";

// ─── Source badge colors ────────────────────────────────────────────────────

const SOURCE_LABELS: Record<MetadataSource, string> = {
  comicvine: "ComicVine",
  mangadex: "MangaDex",
  anilist: "AniList",
  mangabaka: "MangaBaka",
};

const SOURCE_COLORS: Record<MetadataSource, string> = {
  comicvine: "bg-green-500/20 text-green-400 border-green-500/30",
  mangadex: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  anilist: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  mangabaka: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
  light_novel: "Light Novel",
  novel: "Novel",
};

const MEDIA_TYPE_COLORS: Record<MediaType, string> = {
  manga: "bg-blue-500/20 text-blue-400",
  manhwa: "bg-purple-500/20 text-purple-400",
  comic: "bg-green-500/20 text-green-400",
  light_novel: "bg-yellow-500/20 text-yellow-400",
  novel: "bg-orange-500/20 text-orange-400",
};

const STATUS_LABELS: Record<SeriesStatus, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
  unknown: "Unknown",
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  mediaType: MediaType;
  source: MetadataSource;
  year: number;
  status: SeriesStatus;
  description: string;
  coverColor: string;
  metadataId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ResultCardProps {
  result: SearchResult;
  added?: boolean;
  onAdd: (result: SearchResult) => void;
}

export function ResultCard({ result, added = false, onAdd }: ResultCardProps) {
  return (
    <Card className="group flex gap-4 p-4 hover:border-accent/30 transition-all duration-200">
      {/* Cover */}
      <CoverPlaceholder
        title={result.title}
        mediaType={MEDIA_TYPE_LABELS[result.mediaType]}
        seed={result.metadataId}
        className="h-[80px] w-[58px] shrink-0 rounded-lg"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Top row: title + badges */}
        <div className="flex items-start gap-2">
          <h3 className="text-sm font-semibold text-text-primary truncate leading-snug">
            {result.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0",
                MEDIA_TYPE_COLORS[result.mediaType],
              )}
            >
              {MEDIA_TYPE_LABELS[result.mediaType]}
            </Badge>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0 rounded-md border font-medium leading-none inline-flex items-center",
                SOURCE_COLORS[result.source],
              )}
            >
              {SOURCE_LABELS[result.source]}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
          <span>{result.year}</span>
          <span className="text-border">·</span>
          <span>{STATUS_LABELS[result.status]}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
          {result.description}
        </p>
      </div>

      {/* Add button */}
      <div className="shrink-0 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(result);
          }}
          disabled={added}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
            added
              ? "bg-success/15 text-success cursor-default"
              : "bg-accent text-text-inverse hover:bg-accent-hover active:scale-95",
          )}
        >
          {added ? (
            <>
              <Check className="h-3 w-3" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              Add
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
