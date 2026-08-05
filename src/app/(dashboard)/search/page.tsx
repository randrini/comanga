"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ResultCard, type SearchResult } from "@/components/search/result-card";
import {
  AddSeriesDialog,
  type AddSeriesInput,
} from "@/components/series/add-series-dialog";
import {
  Search,
  LayoutGrid,
  List,
  Library,
  BookOpen,
} from "lucide-react";
import type { MediaType, MetadataSource } from "@/types";

// ─── Mock search results ─────────────────────────────────────────────────────

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "sr-1",
    title: "One Piece",
    mediaType: "manga",
    source: "mangadex",
    year: 1997,
    status: "ongoing",
    description:
      "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever: the legendary One Piece.",
    coverColor: "#e63946",
    metadataId: "a1c7c817-4e59-43b7-9365-09675a149a6f",
  },
  {
    id: "sr-2",
    title: "Berserk",
    mediaType: "manga",
    source: "mangadex",
    year: 1989,
    status: "hiatus",
    description:
      "Guts, a former mercenary now known as the Black Swordsman, seeks revenge against the God Hand and their apostles who branded him for sacrifice.",
    coverColor: "#1d3557",
    metadataId: "801513ba-a712-498c-8f57-cae55b38cc92",
  },
  {
    id: "sr-3",
    title: "Invincible",
    mediaType: "comic",
    source: "comicvine",
    year: 2003,
    status: "completed",
    description:
      "Mark Grayson is a normal teenager except for the fact that his father is the most powerful superhero on the planet. He must learn to balance his life.",
    coverColor: "#003049",
    metadataId: "4050-18049",
  },
  {
    id: "sr-4",
    title: "The Walking Dead",
    mediaType: "comic",
    source: "comicvine",
    year: 2003,
    status: "completed",
    description:
      "Rick Grimes wakes from a coma to a world overrun by zombies. He must lead a group of survivors through a post-apocalyptic landscape.",
    coverColor: "#6b705c",
    metadataId: "4050-18166",
  },
  {
    id: "sr-5",
    title: "Solo Leveling",
    mediaType: "manhwa",
    source: "mangadex",
    year: 2018,
    status: "completed",
    description:
      "In a world where hunters must battle deadly monsters, the weakest hunter Sung Jin-Woo gains a strange power that allows him to level up endlessly.",
    coverColor: "#2a9d8f",
    metadataId: "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
  },
  {
    id: "sr-6",
    title: "Sword Art Online",
    mediaType: "light_novel",
    source: "anilist",
    year: 2009,
    status: "ongoing",
    description:
      "In the near future, a Virtual Reality Massive Multiplayer Online Role-Playing Game called Sword Art Online is released. Players soon discover they cannot log out.",
    coverColor: "#6a4c93",
    metadataId: "21400",
  },
  {
    id: "sr-7",
    title: "Batman",
    mediaType: "comic",
    source: "comicvine",
    year: 1940,
    status: "ongoing",
    description:
      "The Dark Knight of Gotham City wages an endless war on crime. Bruce Wayne uses his intellect, technology, and martial arts to protect his city.",
    coverColor: "#2b2d42",
    metadataId: "4050-18071",
  },
  {
    id: "sr-8",
    title: "Chainsaw Man",
    mediaType: "manga",
    source: "mangadex",
    year: 2018,
    status: "ongoing",
    description:
      "Denji is a young man trapped in poverty, working off his deceased father's debt to the yakuza by hunting devils with his pet devil-dog Pochita.",
    coverColor: "#d90429",
    metadataId: "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b",
  },
  {
    id: "sr-9",
    title: "Tower of God",
    mediaType: "manhwa",
    source: "mangadex",
    year: 2010,
    status: "ongoing",
    description:
      "Twenty-Fifth Bam had been alone his whole life until he met Rachel. Now Rachel wants to climb the Tower, and Bam follows her, determined to stay together.",
    coverColor: "#f4a261",
    metadataId: "f9c7fe32-31d9-4b1c-bb2b-0d4e3f1e8b2a",
  },
  {
    id: "sr-10",
    title: "Vagabond",
    mediaType: "manga",
    source: "mangadex",
    year: 1998,
    status: "hiatus",
    description:
      "Growing up in 17th century Japan, Shinmen Takezo is shunned by his village for his wild nature. He seeks to become the greatest swordsman in the land.",
    coverColor: "#bc6c25",
    metadataId: "b8e2d1a3-7f45-4c9e-a1b2-3d6e8f0c4a5b",
  },
];

// ─── Labels ──────────────────────────────────────────────────────────────────

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
  light_novel: "Light Novel",
  novel: "Novel",
};

const SOURCE_LABELS: Record<MetadataSource, string> = {
  comicvine: "ComicVine",
  mangadex: "MangaDex",
  anilist: "AniList",
  mangabaka: "MangaBaka",
};

const SOURCE_COLORS: Record<MetadataSource, string> = {
  comicvine: "bg-green-500/20 text-green-400",
  mangadex: "bg-blue-500/20 text-blue-400",
  anilist: "bg-purple-500/20 text-purple-400",
  mangabaka: "bg-orange-500/20 text-orange-400",
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
  unknown: "Unknown",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<MetadataSource | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const results = useMemo(() => {
    let filtered = MOCK_RESULTS;

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }

    if (mediaFilter !== "all") {
      filtered = filtered.filter((r) => r.mediaType === mediaFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((r) => r.source === sourceFilter);
    }

    return filtered;
  }, [query, mediaFilter, sourceFilter]);

  const handleAddClick = (result: SearchResult) => {
    setSelectedResult(result);
    setDialogOpen(true);
  };

  const handleAddConfirm = (input: AddSeriesInput) => {
    setAddedIds((prev) => new Set(prev).add(selectedResult!.id));
    setDialogOpen(false);
    setSelectedResult(null);

    setToast(`"${input.title}" added to library`);
    setTimeout(() => setToast(null), 3000);
  };

  const columns: Column<SearchResult>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-7 rounded-md shrink-0 flex items-center justify-center"
            style={{ backgroundColor: row.coverColor }}
          >
            <span className="text-white/80 font-bold text-[10px] select-none leading-none">
              {row.title.charAt(0)}
            </span>
          </div>
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
        <Badge
          className={cn(
            "text-[10px] px-1.5 py-0",
            (() => {
              const colors: Record<MediaType, string> = {
                manga: "bg-blue-500/20 text-blue-400",
                manhwa: "bg-purple-500/20 text-purple-400",
                comic: "bg-green-500/20 text-green-400",
                light_novel: "bg-yellow-500/20 text-yellow-400",
                novel: "bg-orange-500/20 text-orange-400",
              };
              return colors[row.mediaType];
            })(),
          )}
        >
          {MEDIA_TYPE_LABELS[row.mediaType]}
        </Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      className: "w-24",
      render: (row) => (
        <Badge className={cn("text-[10px] px-1.5 py-0", SOURCE_COLORS[row.source])}>
          {SOURCE_LABELS[row.source]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-24",
      render: (row) => (
        <span className="text-xs text-text-muted">
          {STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span className="text-xs text-text-muted line-clamp-1 max-w-[300px] block">
          {row.description}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-28",
      render: (row) => {
        const added = addedIds.has(row.id);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!added) handleAddClick(row);
            }}
            disabled={added}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
              added
                ? "bg-success/15 text-success cursor-default"
                : "bg-accent text-text-inverse hover:bg-accent-hover active:scale-95",
            )}
          >
            {added ? "Added" : "Add"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-text-primary">
          Add Series
        </h1>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent transition-colors duration-200" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a series to add to your library..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-bg-surface border border-border/50 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
            autoFocus
          />
        </div>

        {/* Media type filter */}
        <select
          value={mediaFilter}
          onChange={(e) => setMediaFilter(e.target.value as MediaType | "all")}
          className="h-11 px-3.5 text-xs bg-bg-surface border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
          <option value="comic">Comic</option>
          <option value="light_novel">Light Novel</option>
          <option value="novel">Novel</option>
        </select>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value as MetadataSource | "all")
          }
          className="h-11 px-3.5 text-xs bg-bg-surface border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="all">All Sources</option>
          <option value="comicvine">ComicVine</option>
          <option value="mangadex">MangaDex</option>
          <option value="anilist">AniList</option>
          <option value="mangabaka">MangaBaka</option>
        </select>
      </div>

      {/* Results bar */}
      <div className="flex items-center gap-3 mb-5">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border/50 overflow-hidden bg-bg-surface/50">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 text-xs transition-all duration-200",
              viewMode === "list"
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover/50",
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 text-xs transition-all duration-200",
              viewMode === "grid"
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text-primary hover:bg-bg-hover/50",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-xs text-text-muted ml-auto tabular-nums">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-2xl bg-bg-surface border border-border/50 flex items-center justify-center mb-5">
            {query.trim() ? (
              <Search className="h-8 w-8 text-text-muted" />
            ) : (
              <BookOpen className="h-8 w-8 text-text-muted" />
            )}
          </div>
          {query.trim() ? (
            <>
              <h2 className="text-base font-semibold text-text-primary mb-1.5">
                No results found
              </h2>
              <p className="text-sm text-text-muted max-w-sm">
                No series matched &ldquo;{query}&rdquo;. Try a different search
                term or adjust your filters.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-text-primary mb-1.5">
                Search for a series
              </h2>
              <p className="text-sm text-text-muted max-w-sm">
                Search across metadata sources to find and add a new series to
                your library.
              </p>
            </>
          )}
        </div>
      ) : viewMode === "list" ? (
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={results}
            getRowKey={(row) => row.id}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              added={addedIds.has(result.id)}
              onAdd={handleAddClick}
            />
          ))}
        </div>
      )}

      {/* Add Series Dialog */}
      <AddSeriesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        series={selectedResult}
        onAdd={handleAddConfirm}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-bg-surface border border-success/20 rounded-xl shadow-elevated">
            <span className="flex h-2 w-2 rounded-full bg-success shadow-[0_0_6px_#22c55e]" />
            <span className="text-sm text-text-primary">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
