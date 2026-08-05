import type {
  MetadataClient,
  MetadataSearchResult,
  MetadataSeries,
  MetadataVolume,
  MetadataChapter,
} from './types';

export class MangaDexClient implements MetadataClient {
  readonly baseUrl = 'https://api.mangadex.org';

  constructor() {
    const enabled = process.env.MANGADEX_ENABLED;
    if (enabled === undefined || enabled === '') {
      // Not explicitly configured — allow construction but flag as unchecked
    }
  }

  async search(
    _query: string,
    _options?: { mediaType?: import('./types').MediaType; limit?: number },
  ): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: mangadex.search');
  }

  async getSeries(_sourceId: string): Promise<MetadataSeries> {
    throw new Error('Not implemented: mangadex.getSeries');
  }

  async getVolumes(_sourceId: string): Promise<MetadataVolume[]> {
    throw new Error('Not implemented: mangadex.getVolumes');
  }

  async getChapters(
    _sourceId: string,
    _volumeSourceId?: string,
  ): Promise<MetadataChapter[]> {
    throw new Error('Not implemented: mangadex.getChapters');
  }

  async getStatus(): Promise<{ connected: boolean; rateLimitRemaining?: number }> {
    throw new Error('Not implemented: mangadex.getStatus');
  }

  // ─── MangaDex-specific methods ──────────────────────────────────────────────

  async getManga(_mangaId: string): Promise<MetadataSeries> {
    throw new Error('Not implemented: mangadex.getManga');
  }

  async getFeed(
    _mangaId: string,
  ): Promise<{ chapters: MetadataChapter[] }> {
    throw new Error('Not implemented: mangadex.getFeed');
  }

  async getScanlationGroups(): Promise<
    { id: string; name: string; website?: string }[]
  > {
    throw new Error('Not implemented: mangadex.getScanlationGroups');
  }
}

export const mangadex = new MangaDexClient();
