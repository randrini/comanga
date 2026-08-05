import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class SabnzbdClient implements DownloadClient {
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = process.env.SABNZBD_URL ?? '';
    this.apiKey = process.env.SABNZBD_API_KEY ?? '';
  }

  async search(query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: sabnzbd.search');
  }

  async addDownload(url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: sabnzbd.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: sabnzbd.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: sabnzbd.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: sabnzbd.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: sabnzbd.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: sabnzbd.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: false };
  }

  // SABnzbd-specific methods

  async getHistory(): Promise<unknown> {
    throw new Error('Not implemented: sabnzbd.getHistory');
  }

  async getCategories(): Promise<unknown> {
    throw new Error('Not implemented: sabnzbd.getCategories');
  }

  async pauseQueue(): Promise<void> {
    throw new Error('Not implemented: sabnzbd.pauseQueue');
  }

  async resumeQueue(): Promise<void> {
    throw new Error('Not implemented: sabnzbd.resumeQueue');
  }
}

export const sabnzbd = new SabnzbdClient();
