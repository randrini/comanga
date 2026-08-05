import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class GetComicsClient implements DownloadClient {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.GETCOMICS_ENABLED === 'true';
  }

  async search(_query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: getcomics.search');
  }

  async addDownload(_url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: getcomics.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: getcomics.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: getcomics.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: getcomics.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: getcomics.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: getcomics.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: this.enabled };
  }

  // GetComics-specific methods

  async searchComics(_query: string): Promise<unknown> {
    throw new Error('Not implemented: getcomics.searchComics');
  }

  async parsePage(_url: string): Promise<unknown> {
    throw new Error('Not implemented: getcomics.parsePage');
  }
}

export const getcomics = new GetComicsClient();
