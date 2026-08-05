import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export type DownloadStatus =
  | "pending"
  | "queued"
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

export type MediaType = "manga" | "manhwa" | "comic" | "light_novel" | "novel";

export type MetadataSource = "comicvine" | "mangadex" | "anilist" | "mangabaka";

export type DownloaderType = "slskd" | "prowlarr_torrent" | "prowlarr_usenet" | "getcomics" | "comicscode";

export const STATUS_COLORS: Record<DownloadStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  queued: "bg-gray-500/20 text-gray-400",
  searching: "bg-blue-500/20 text-blue-400",
  downloading: "bg-blue-500/20 text-blue-400",
  verifying: "bg-purple-500/20 text-purple-400",
  importing: "bg-indigo-500/20 text-indigo-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  awaiting_release: "bg-gray-500/20 text-gray-400",
  stalled: "bg-orange-500/20 text-orange-400",
  blocked: "bg-red-500/20 text-red-400",
  manual_search: "bg-yellow-500/20 text-yellow-400",
};