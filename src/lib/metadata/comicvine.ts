import type {
  MetadataClient,
  MetadataSearchResult,
  MetadataSeries,
  MetadataVolume,
  MetadataChapter,
} from './types';

export class ComicVineClient implements MetadataClient {
  private readonly apiKey: string;
  readonly baseUrl = 'https://comicvine.gamespot.com/api';

  constructor() {
    const key = process.env.COMICVINE_API_KEY;
    if (!key) {
      throw new Error(
        'ComicVineClient: COMICVINE_API_KEY environment variable is not set',
      );
    }
    this.apiKey = key;
  }

  async search(
    _query: string,
    _options?: { mediaType?: import('./types').MediaType; limit?: number },
  ): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: comicvine.search');
  }

  async getSeries(_sourceId: string): Promise<MetadataSeries> {
    throw new Error('Not implemented: comicvine.getSeries');
  }

  async getVolumes(_sourceId: string): Promise<MetadataVolume[]> {
    throw new Error('Not implemented: comicvine.getVolumes');
  }

  async getChapters(
    _sourceId: string,
    _volumeSourceId?: string,
  ): Promise<MetadataChapter[]> {
    throw new Error('Not implemented: comicvine.getChapters');
  }

  async getStatus(): Promise<{ connected: boolean; rateLimitRemaining?: number }> {
    throw new Error('Not implemented: comicvine.getStatus');
  }

  // ─── ComicVine-specific methods ─────────────────────────────────────────────

  async getIssues(_volumeId: string): Promise<MetadataChapter[]> {
    throw new Error('Not implemented: comicvine.getIssues');
  }

  async getIssue(_issueId: string): Promise<MetadataChapter> {
    throw new Error('Not implemented: comicvine.getIssue');
  }

  async searchVolumes(_query: string): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: comicvine.searchVolumes');
  }
}

export const comicvine = new ComicVineClient();
