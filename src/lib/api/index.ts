export type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  DownloaderType,
  MediaType,
  SearchOptions,
  SearchResult,
} from './types';

export { SlskdClient, slskd } from './slskd';
export { ProwlarrClient, prowlarr } from './prowlarr';
export { QbittorrentClient, qbittorrent } from './qbittorrent';
export { SabnzbdClient, sabnzbd } from './sabnzbd';
export { GetComicsClient, getcomics } from './getcomics';
export { ComicsCodeClient, comicscode } from './comicscode';

import type { DownloaderType } from './types';
import { slskd } from './slskd';
import { prowlarr } from './prowlarr';
import { qbittorrent } from './qbittorrent';
import { sabnzbd } from './sabnzbd';
import { getcomics } from './getcomics';
import { comicscode } from './comicscode';

const downloaderMap: Record<DownloaderType, { getStatus: () => Promise<{ connected: boolean }> }> = {
  slskd,
  prowlarr_torrent: prowlarr,
  prowlarr_usenet: prowlarr,
  getcomics,
  comicscode,
};

/**
 * Returns the appropriate downloader singleton for the given type.
 */
export function getDownloader(type: DownloaderType) {
  return downloaderMap[type];
}

/**
 * Returns a list of downloader types that are currently enabled
 * based on environment variable flags.
 */
export function enabledDownloaders(): DownloaderType[] {
  const enabled: DownloaderType[] = [];

  if (process.env.SLSKD_URL && process.env.SLSKD_API_KEY) {
    enabled.push('slskd');
  }
  if (process.env.PROWLARR_URL && process.env.PROWLARR_API_KEY) {
    enabled.push('prowlarr_torrent');
    enabled.push('prowlarr_usenet');
  }
  if (process.env.GETCOMICS_ENABLED === 'true') {
    enabled.push('getcomics');
  }
  if (process.env.COMICSCODE_ENABLED === 'true') {
    enabled.push('comicscode');
  }

  return enabled;
}
