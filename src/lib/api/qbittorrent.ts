import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

export class QbittorrentClient implements DownloadClient {
  private url: string;
  private username: string;
  private password: string;

  constructor() {
    this.url = process.env.QBITTORRENT_URL ?? '';
    this.username = process.env.QBITTORRENT_USERNAME ?? '';
    this.password = process.env.QBITTORRENT_PASSWORD ?? '';
  }

  async search(_query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    throw new Error('Not implemented: qbittorrent.search');
  }

  async addDownload(_url: string, _options?: DownloadOptions): Promise<string> {
    throw new Error('Not implemented: qbittorrent.addDownload');
  }

  async getProgress(_clientId: string): Promise<DownloadProgress> {
    throw new Error('Not implemented: qbittorrent.getProgress');
  }

  async cancel(_clientId: string): Promise<void> {
    throw new Error('Not implemented: qbittorrent.cancel');
  }

  async pause(_clientId: string): Promise<void> {
    throw new Error('Not implemented: qbittorrent.pause');
  }

  async resume(_clientId: string): Promise<void> {
    throw new Error('Not implemented: qbittorrent.resume');
  }

  async remove(_clientId: string): Promise<void> {
    throw new Error('Not implemented: qbittorrent.remove');
  }

  async getStatus(): Promise<DownloaderStatus> {
    return { connected: false };
  }

  // qBittorrent-specific methods

  async login(): Promise<void> {
    throw new Error('Not implemented: qbittorrent.login');
  }

  async getTorrents(): Promise<unknown> {
    throw new Error('Not implemented: qbittorrent.getTorrents');
  }

  async getTrackers(_hash: string): Promise<unknown> {
    throw new Error('Not implemented: qbittorrent.getTrackers');
  }

  async setCategory(_hash: string, _category: string): Promise<void> {
    throw new Error('Not implemented: qbittorrent.setCategory');
  }
}

export const qbittorrent = new QbittorrentClient();
