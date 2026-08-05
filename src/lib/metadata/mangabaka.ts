import type {
  MetadataClient,
  MetadataSearchResult,
  MetadataSeries,
  MetadataVolume,
  MetadataChapter,
} from './types';

export class MangaBakaClient implements MetadataClient {
  constructor() {
    const enabled = process.env.MANGABAKA_ENABLED;
    if (enabled === undefined || enabled === '') {
      // Not explicitly configured — allow construction but flag as unchecked
    }
  }

  async search(
    _query: string,
    _options?: { mediaType?: import('./types').MediaType; limit?: number },
  ): Promise<MetadataSearchResult[]> {
    throw new Error('Not implemented: mangabaka.search');
  }

  async getSeries(_sourceId: string): Promise<MetadataSeries> {
    throw new Error('Not implemented: mangabaka.getSeries');
  }

  async getVolumes(_sourceId: string): Promise<MetadataVolume[]> {
    throw new Error('Not implemented: mangabaka.getVolumes');
  }

  async getChapters(
    _sourceId: string,
    _volumeSourceId?: string,
  ): Promise<MetadataChapter[]> {
    throw new Error('Not implemented: mangabaka.getChapters');
  }

  async getStatus(): Promise<{ connected: boolean; rateLimitRemaining?: number }> {
    throw new Error('Not implemented: mangabaka.getStatus');
  }
}

export const mangabaka = new MangaBakaClient();
