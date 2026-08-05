import type {
  MetadataClient,
  MetadataSearchResult,
  MetadataSeries,
  MetadataVolume,
  MetadataChapter,
} from './types';

export class AniListClient implements MetadataClient {
  readonly baseUrl = 'https://graphql.anilist.co';

  constructor() {
    const enabled = process.env.ANILIST_ENABLED;
    if (enabled === undefined || enabled === '') {
      // Not explicitly configured — allow construction but flag as unchecked
    }
  }

  async search(
    _query: string,
    _options?: { mediaType?: import('./types').MediaType; limit?: number },
  ): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: anilist.search');
  }

  async getSeries(_sourceId: string): Promise<MetadataSeries> {
    throw new Error('Not implemented: anilist.getSeries');
  }

  async getVolumes(_sourceId: string): Promise<MetadataVolume[]> {
    throw new Error('Not implemented: anilist.getVolumes');
  }

  async getChapters(
    _sourceId: string,
    _volumeSourceId?: string,
  ): Promise<MetadataChapter[]> {
    throw new Error('Not implemented: anilist.getChapters');
  }

  async getStatus(): Promise<{ connected: boolean; rateLimitRemaining?: number }> {
    throw new Error('Not implemented: anilist.getStatus');
  }

  // ─── AniList-specific methods ────────────────────────────────────────────────

  async getMedia(_id: number): Promise<MetadataSeries> {
    throw new Error('Not implemented: anilist.getMedia');
  }

  async searchMedia(
    _query: string,
    _type: string,
  ): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: anilist.searchMedia');
  }
}

export const anilist = new AniListClient();
