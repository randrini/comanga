export type MediaType = "manga" | "manhwa" | "comic" | "light_novel" | "novel";

export type DownloadStatus =
  | "pending"
  | "searching"
  | "downloading"
  | "verifying"
  | "importing"
  | "completed"
  | "failed"
  | "awaiting_release"
  | "stalled"
  | "blocked"
  | "manual_search";

export type MetadataSource = "comicvine" | "mangadex" | "anilist" | "mangabaka";

export type DownloaderType =
  | "slskd"
  | "prowlarr_torrent"
  | "prowlarr_usenet"
  | "getcomics"
  | "comicscode";

export type MonitorType = "all" | "new" | "none";

export type SeriesStatus = "ongoing" | "completed" | "hiatus" | "unknown";

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string;
  mediaType: MediaType;
  status: SeriesStatus;
  coverUrl?: string;
  yearStart?: number;
  yearEnd?: number;
  metadataSource?: MetadataSource;
  metadataId?: string;
  monitored: boolean;
  monitorType: MonitorType;
  rootFolder?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Volume {
  id: string;
  seriesId: string;
  volumeNumber: number;
  title?: string;
  coverUrl?: string;
  metadataSource?: MetadataSource;
  metadataId?: string;
  releasedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  seriesId: string;
  volumeId?: string;
  chapterNumber: number;
  title?: string;
  pages?: number;
  releasedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Download {
  id: string;
  seriesId: string;
  volumeId?: string;
  chapterId?: string;
  status: DownloadStatus;
  downloaderType: DownloaderType;
  downloadUrl?: string;
  downloadPath?: string;
  fileSize?: number;
  progress: number;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  priority: number;
  autoSearch: boolean;
  blockedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
  light_novel: "Light Novel",
  novel: "Novel",
};

export const MEDIA_TYPE_COLORS: Record<MediaType, string> = {
  manga: "bg-blue-500/20 text-blue-400",
  manhwa: "bg-purple-500/20 text-purple-400",
  comic: "bg-green-500/20 text-green-400",
  light_novel: "bg-yellow-500/20 text-yellow-400",
  novel: "bg-orange-500/20 text-orange-400",
};

export const STATUS_LABELS: Record<DownloadStatus, string> = {
  pending: "Pending",
  searching: "Searching",
  downloading: "Downloading",
  verifying: "Verifying",
  importing: "Importing",
  completed: "Completed",
  failed: "Failed",
  awaiting_release: "Awaiting Release",
  stalled: "Stalled",
  blocked: "Blocked",
  manual_search: "Manual Search",
};