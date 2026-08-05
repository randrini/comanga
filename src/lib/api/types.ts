export interface SearchResult {
  title: string;
  url: string;
  fileSize?: number;
  seeders?: number;
  leechers?: number;
  source: DownloaderType;
  quality?: string;
  releaseGroup?: string;
}

export interface DownloadProgress {
  downloadId: string;
  progress: number; // 0-100
  speed: number; // bytes/sec
  eta: number; // seconds remaining
  fileSize: number;
  downloaded: number;
}

export interface DownloadClient {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  addDownload(url: string, options?: DownloadOptions): Promise<string>; // returns job/client ID
  getProgress(clientId: string): Promise<DownloadProgress>;
  cancel(clientId: string): Promise<void>;
  pause(clientId: string): Promise<void>;
  resume(clientId: string): Promise<void>;
  remove(clientId: string): Promise<void>;
  getStatus(): Promise<DownloaderStatus>;
}

export interface SearchOptions {
  mediaType?: MediaType;
  year?: number;
  volume?: number;
  chapter?: number;
  limit?: number;
}

export interface DownloadOptions {
  category?: string;
  savePath?: string;
  priority?: number;
  tags?: string[];
}

export interface DownloaderStatus {
  connected: boolean;
  version?: string;
  freeSpace?: number;
  activeDownloads?: number;
}

export type DownloaderType = 'slskd' | 'prowlarr_torrent' | 'prowlarr_usenet' | 'getcomics' | 'comicscode';
export type MediaType = 'manga' | 'manhwa' | 'comic' | 'light_novel' | 'novel';
