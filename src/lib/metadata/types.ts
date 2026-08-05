export interface MetadataSeries {
  source: MetadataSource;
  sourceId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  mediaType: MediaType;
  status: 'ongoing' | 'completed' | 'hiatus' | 'unknown';
  yearStart?: number;
  yearEnd?: number;
  authors?: MetadataPerson[];
  genres?: string[];
  tags?: string[];
  externalUrls?: { label: string; url: string }[];
  chapterCount?: number;
  volumeCount?: number;
}

export interface MetadataVolume {
  source: MetadataSource;
  sourceId: string;
  seriesSourceId: string;
  volumeNumber: number;
  title?: string;
  coverUrl?: string;
  releaseDate?: string;
  issueCount?: number;
}

export interface MetadataChapter {
  source: MetadataSource;
  sourceId: string;
  seriesSourceId: string;
  volumeSourceId?: string;
  chapterNumber: number;
  title?: string;
  pages?: number;
  releaseDate?: string;
}

export interface MetadataPerson {
  name: string;
  role: 'author' | 'artist' | 'writer' | 'penciler' | 'inker' | 'colorist' | 'letterer' | 'cover_artist' | 'editor';
}

export interface MetadataSearchResult {
  source: MetadataSource;
  sourceId: string;
  title: string;
  coverUrl?: string;
  mediaType?: MediaType;
  yearStart?: number;
}

export interface MetadataClient {
  search(query: string, options?: { mediaType?: MediaType; limit?: number }): Promise<MetadataSearchResult[]>;
  getSeries(sourceId: string): Promise<MetadataSeries>;
  getVolumes(sourceId: string): Promise<MetadataVolume[]>;
  getChapters(sourceId: string, volumeSourceId?: string): Promise<MetadataChapter[]>;
  getStatus(): Promise<{ connected: boolean; rateLimitRemaining?: number }>;
}

export type MetadataSource = 'comicvine' | 'mangadex' | 'anilist' | 'mangabaka';
export type MediaType = 'manga' | 'manhwa' | 'comic' | 'light_novel' | 'novel';
