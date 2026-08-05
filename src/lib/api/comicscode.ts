import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class ComicsCodeClient implements DownloadClient {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.COMICSCODE_ENABLED === 'true';
  }

  async search(_query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: comicscode.search');
  }

  async addDownload(_url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: comicscode.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: comicscode.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: comicscode.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: comicscode.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: comicscode.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: comicscode.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: this.enabled };
  }
}

export const comicscode = new ComicsCodeClient();
