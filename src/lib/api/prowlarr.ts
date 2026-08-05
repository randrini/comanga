import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class ProwlarrClient implements DownloadClient {
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = process.env.PROWLARR_URL ?? '';
    this.apiKey = process.env.PROWLARR_API_KEY ?? '';
  }

  async search(_query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: prowlarr.search');
  }

  async addDownload(_url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: prowlarr.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: prowlarr.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: prowlarr.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: prowlarr.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: prowlarr.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: prowlarr.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: false };
  }

  // Prowlarr-specific methods

  async getCategories(): Promise<unknown> {
    throw new Error('Not implemented: prowlarr.getCategories');
  }

  async getIndexers(): Promise<unknown> {
    throw new Error('Not implemented: prowlarr.getIndexers');
  }

  async testIndexer(_id: string): Promise<unknown> {
    throw new Error('Not implemented: prowlarr.testIndexer');
  }
}

export const prowlarr = new ProwlarrClient();
