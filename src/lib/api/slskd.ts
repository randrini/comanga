import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class SlskdClient implements DownloadClient {
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = process.env.SLSKD_URL ?? '';
    this.apiKey = process.env.SLSKD_API_KEY ?? '';
  }

  async search(query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: slskd.search');
  }

  async addDownload(url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: slskd.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: slskd.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: slskd.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: slskd.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: slskd.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: slskd.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: false };
  }

  // SLSKD-specific methods

  async searchFiles(query: string): Promise<unknown> {
    throw new Error('Not implemented: slskd.searchFiles');
  }

  async getDownloads(): Promise<unknown> {
    throw new Error('Not implemented: slskd.getDownloads');
  }

  async getShares(): Promise<unknown> {
    throw new Error('Not implemented: slskd.getShares');
  }
}

export const slskd = new SlskdClient();
