export type {
  MetadataSeries,
  MetadataVolume,
  MetadataChapter,
  MetadataPerson,
  MetadataSearchResult,
  MetadataClient,
  MetadataSource,
  MediaType,
} from './types';

export { ComicVineClient } from './comicvine';
export { MangaDexClient } from './mangadex';
export { AniListClient } from './anilist';
export { MangaBakaClient } from './mangabaka';
export { MetadataCache } from './cache';

export { comicvine } from './comicvine';
export { mangadex } from './mangadex';
export { anilist } from './anilist';
export { mangabaka } from './mangabaka';
export { metadataCacheInstance as metadataCache } from './cache';

import type { MetadataClient, MetadataSource } from './types';
import { comicvine } from './comicvine';
import { mangadex } from './mangadex';
import { anilist } from './anilist';
import { mangabaka } from './mangabaka';

const clientMap: Record<MetadataSource, MetadataClient> = {
  comicvine,
  mangadex,
  anilist,
  mangabaka,
};

/**
 * Return the singleton client for the given metadata source.
 */
export function getMetadataClient(source: MetadataSource): MetadataClient {
  return clientMap[source];
}

/**
 * Return the list of metadata sources that are enabled via environment variables.
 */
export function enabledSources(): MetadataSource[] {
  const sources: MetadataSource[] = [];

  if (process.env.COMICVINE_API_KEY) {
    sources.push('comicvine');
  }
  if (process.env.MANGADEX_ENABLED && process.env.MANGADEX_ENABLED !== 'false') {
    sources.push('mangadex');
  }
  if (process.env.ANILIST_ENABLED && process.env.ANILIST_ENABLED !== 'false') {
    sources.push('anilist');
  }
  if (process.env.MANGABAKA_ENABLED && process.env.MANGABAKA_ENABLED !== 'false') {
    sources.push('mangabaka');
  }

  return sources;
}
