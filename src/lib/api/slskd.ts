/**
 * SLSKD API Client
 *
 * Full API Reference for slskd (Soulseek client) v0 API
 * Source: https://github.com/slskd/slskd
 *
 * Base URL: http://<host>:5030/api/v0/  (default HTTP port 5030, HTTPS port 5031)
 * Auth:     X-API-Key header (preferred) or JWT Bearer token (via session login)
 *
 * Rate Limits:
 *   - Search: 1 concurrent request (SemaphoreSlim(1,1))
 *   - Download: 2 concurrent requests (SemaphoreSlim(2,2))
 *   - Returns HTTP 429 when throttled
 */

import type {
  DownloadClient,
  DownloadOptions,
  DownloadProgress,
  DownloaderStatus,
  SearchOptions,
  SearchResult,
} from './types';

// ──────────────────────────────────────────────
// Type Definitions (from C# source code analysis)
// ──────────────────────────────────────────────

/** Soulseek search states (flags enum) */
export type SearchState = 'None' | 'InProgress' | 'Completed' | 'Cancelled' | 'Errored';

/** Soulseek transfer states (flags enum) */
export type TransferState =
  | 'None'
  | 'Requested'
  | 'Queued'
  | 'Queued_Locally'
  | 'Queued_Remotely'
  | 'Initializing'
  | 'InProgress'
  | 'Completed'
  | 'Completed_Succeeded'
  | 'Completed_Cancelled'
  | 'Completed_TimedOut'
  | 'Completed_Errored'
  | 'Completed_Rejected'
  | 'Completed_Aborted';

/** Transfer direction */
export type TransferDirection = 'Download' | 'Upload';

/** User presence */
export type UserPresence = 'Offline' | 'Away' | 'Online';

/** Server state */
export interface ServerState {
  address: string;
  port: number;
  state: string;
  username: string;
}

/** Application state */
export interface ApplicationState {
  server: ServerState;
  version: {
    assemblyVersion: string;
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    updateCheckDate: string | null;
  };
}

/** A file in a search result */
export interface SearchResultFile {
  bitDepth: number | null;
  bitRate: number | null;
  code: number;
  extension: string;
  filename: string;
  isVariableBitRate: boolean | null;
  length: number | null;       // seconds
  sampleRate: number | null;
  size: number;                // bytes
  isLocked: boolean;
}

/** A search response from a peer */
export interface SearchResponse {
  fileCount: number;
  files: SearchResultFile[];
  hasFreeUploadSlot: boolean;
  lockedFileCount: number;
  lockedFiles: SearchResultFile[];
  queueLength: number;
  token: number;
  uploadSpeed: number;
  username: string;
}

/** A search record */
export interface SearchRecord {
  id: string;                  // GUID
  searchText: string;
  state: SearchState;
  token: number;
  responseCount: number;
  fileCount: number;
  lockedFileCount: number;
  startedAt: string;           // ISO 8601
  endedAt: string | null;
  isComplete: boolean;
  responses?: SearchResponse[];
}

/** A transfer (download or upload) */
export interface Transfer {
  id: string;                  // GUID
  batchId: string | null;
  username: string;
  direction: TransferDirection;
  filename: string;
  size: number;
  state: TransferState;
  requestedAt: string;
  enqueuedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  bytesTransferred: number;
  averageSpeed: number;
  placeInQueue: number | null;
  exception: string | null;
  attempts: number;
  nextAttemptAt: string | null;
  removed: boolean;
  bytesRemaining: number;
  elapsedTime: string | null;  // duration string
  percentComplete: number;     // 0-100
  remainingTime: string | null;
}

/** A batch of related transfers */
export interface Batch {
  id: string;
  searchId: string | null;
  username: string;
  direction: TransferDirection;
  createdAt: string;
  transfers: Transfer[] | null;
  options: BatchOptions | null;
}

export interface BatchOptions {
  destination: string | null;
  externalId: string | null;
}

/** Directory response (grouped transfers) */
export interface DirectoryResponse {
  directory: string;
  fileCount: number;
  files: Transfer[];
}

/** User response (grouped by user) */
export interface UserResponse {
  username: string;
  directories: DirectoryResponse[];
}

/** User info */
export interface UserInfo {
  description: string;
  hasFreeUploadSlot: boolean;
  hasPicture: boolean;
  picture: string | null;      // base64
  queueLength: number;
  uploadSlots: number;
}

/** User status */
export interface UserStatus {
  isPrivileged: boolean;
  presence: UserPresence;
}

/** User data (from server) */
export interface UserData {
  averageSpeed: number;
  countryCode: string | null;
  directoryCount: number;
  fileCount: number;
  self: boolean | null;
  slotsFree: number | null;
  status: UserPresence;
  uploadCount: number;
  username: string;
}

/** User endpoint */
export interface UserEndpoint {
  address: string;
  port: number;
}

/** Share */
export interface Share {
  id: string;
  name: string;
  directories: ShareDirectory[];
}

export interface ShareDirectory {
  name: string;
  fileCount: number;
}

/** Filesystem directory listing */
export interface FilesystemDirectory {
  name: string;
  path: string;
  directories: FilesystemDirectory[];
  files: FilesystemFile[];
}

export interface FilesystemFile {
  name: string;
  path: string;
  size: number;
}

/** Enqueue download batch request */
export interface EnqueueDownloadBatchRequest {
  id?: string;                 // optional GUID, auto-generated if omitted
  searchId?: string;           // optional associated search GUID
  username: string;
  files: { filename: string; size: number }[];
  options?: {
    destination?: string;       // relative to configured download dir
    externalId?: string;
  };
}

/** Enqueue download batch response */
export interface EnqueueDownloadBatchResponse {
  batch: Batch;
  failures: { filename: string; message: string }[];
}

/** Search request body */
export interface SearchRequestBody {
  id?: string;                 // optional GUID
  searchText: string;
  fileLimit?: number;          // default 10000
  filterResponses?: boolean;   // default true
  maximumPeerQueueLength?: number; // default 1000000
  minimumPeerUploadSpeed?: number; // default 0
  minimumResponseFileCount?: number; // default 1
  responseLimit?: number;      // default 100
  searchTimeout?: number;      // seconds, default 15, min 5
}

/** Login request */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Token response */
export interface TokenResponse {
  token: string;
}

/** Chat room */
export interface Room {
  name: string;
  userCount: number;
  users: string[];
  operators: string[];
}

/** Chat message */
export interface ChatMessage {
  id: string;
  timestamp: string;
  username: string;
  message: string;
  isPrivate: boolean;
  roomName?: string;
}

/** Conversation */
export interface Conversation {
  username: string;
  messages: ChatMessage[];
  isRead: boolean;
}

// ──────────────────────────────────────────────
// SLSKD API Client
// ──────────────────────────────────────────────

export class SlskdClient implements DownloadClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = (process.env.SLSKD_URL ?? '').replace(/\/+$/, '');
    this.apiKey = process.env.SLSKD_API_KEY ?? '';
  }

  /** Get the base API URL for v0 */
  private get apiUrl(): string {
    return `${this.baseUrl}/api/v0`;
  }

  /** Common request headers */
  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      h['X-API-Key'] = this.apiKey;
    }
    return h;
  }

  /** Perform an authenticated fetch request */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | boolean | number | undefined>,
  ): Promise<T> {
    const url = new URL(`${this.apiUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429) {
      throw new Error('Rate limited (429): too many concurrent requests');
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Authentication failed (${res.status})`);
    }
    if (res.status === 404) {
      throw new Error(`Not found (404): ${path}`);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`SLSKD API error ${res.status}: ${text}`);
    }

    // 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  // ────────────────────────────────────────────
  // Session / Authentication
  // ────────────────────────────────────────────

  /** Check if authentication is enabled */
  async isAuthEnabled(): Promise<boolean> {
    return this.request<boolean>('GET', '/session/enabled');
  }

  /** Login with username/password to get a JWT token */
  async login(username: string, password: string): Promise<string> {
    const res = await this.request<TokenResponse>('POST', '/session', {
      username,
      password,
    } as LoginRequest);
    return res.token;
  }

  /** Check if current session/token is valid */
  async checkSession(): Promise<void> {
    await this.request<void>('GET', '/session');
  }

  // ────────────────────────────────────────────
  // Application / Server
  // ────────────────────────────────────────────

  /** Get application state */
  async getState(): Promise<ApplicationState> {
    return this.request<ApplicationState>('GET', '/application');
  }

  /** Get application version */
  async getVersion(): Promise<string> {
    return this.request<string>('GET', '/application/version');
  }

  /** Check for latest version */
  async checkVersion(forceCheck = false): Promise<ApplicationState['version']> {
    return this.request<ApplicationState['version']>(
      'GET',
      '/application/version/latest',
      undefined,
      { forceCheck },
    );
  }

  /** Get server connection state */
  async getServerState(): Promise<ServerState> {
    return this.request<ServerState>('GET', '/server');
  }

  /** Connect to Soulseek server */
  async connectServer(): Promise<void> {
    await this.request<void>('PUT', '/server');
  }

  /** Disconnect from Soulseek server */
  async disconnectServer(message?: string): Promise<void> {
    await this.request<void>('DELETE', '/server', message);
  }

  // ────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────

  /**
   * Perform a search on the Soulseek network.
   *
   * Rate limit: 1 concurrent search. Returns 429 if another search is in progress.
   *
   * @param request - Search parameters
   * @returns The search record with initial state
   */
  async createSearch(request: SearchRequestBody): Promise<SearchRecord> {
    return this.request<SearchRecord>('POST', '/searches', request);
  }

  /** Get all searches */
  async getSearches(): Promise<SearchRecord[]> {
    return this.request<SearchRecord[]>('GET', '/searches');
  }

  /** Get a specific search by ID */
  async getSearch(id: string, includeResponses = false): Promise<SearchRecord> {
    return this.request<SearchRecord>(
      'GET',
      `/searches/${id}`,
      undefined,
      { includeResponses },
    );
  }

  /** Get responses for a specific search */
  async getSearchResponses(id: string): Promise<SearchResponse[]> {
    return this.request<SearchResponse[]>('GET', `/searches/${id}/responses`);
  }

  /** Cancel a search */
  async cancelSearch(id: string): Promise<void> {
    await this.request<void>('PUT', `/searches/${id}`);
  }

  /** Delete a search */
  async deleteSearch(id: string): Promise<void> {
    await this.request<void>('DELETE', `/searches/${id}`);
  }

  // ────────────────────────────────────────────
  // Downloads
  // ────────────────────────────────────────────

  /**
   * Enqueue a batch of downloads (preferred method).
   *
   * Rate limit: 2 concurrent requests. Returns 429 when throttled.
   *
   * @param request - Batch download request
   * @returns Batch response with enqueued transfers and any failures
   */
  async enqueueDownloadBatch(
    request: EnqueueDownloadBatchRequest,
  ): Promise<EnqueueDownloadBatchResponse> {
    return this.request<EnqueueDownloadBatchResponse>(
      'POST',
      '/transfers/downloads/batches',
      request,
    );
  }

  /**
   * Enqueue downloads (legacy, per-user).
   *
   * @deprecated Use enqueueDownloadBatch instead
   */
  async enqueueDownloads(
    username: string,
    files: { filename: string; size: number }[],
  ): Promise<{ enqueued: number; failed: number }> {
    return this.request<{ enqueued: number; failed: number }>(
      'POST',
      `/transfers/downloads/${encodeURIComponent(username)}`,
      files,
    );
  }

  /** Get all downloads, optionally including removed ones */
  async getDownloads(includeRemoved = false): Promise<UserResponse[]> {
    return this.request<UserResponse[]>(
      'GET',
      '/transfers/downloads',
      undefined,
      { includeRemoved },
    );
  }

  /** Get downloads for a specific user */
  async getUserDownloads(username: string): Promise<UserResponse> {
    return this.request<UserResponse>(
      'GET',
      `/transfers/downloads/${encodeURIComponent(username)}`,
    );
  }

  /** Get a specific download by username and ID */
  async getDownload(username: string, id: string): Promise<Transfer> {
    return this.request<Transfer>(
      'GET',
      `/transfers/downloads/${encodeURIComponent(username)}/${id}`,
    );
  }

  /** Get place in queue for a download */
  async getDownloadPlaceInQueue(
    username: string,
    id: string,
  ): Promise<number> {
    return this.request<number>(
      'GET',
      `/transfers/downloads/${encodeURIComponent(username)}/${id}/position`,
    );
  }

  /** Cancel a download */
  async cancelDownload(
    username: string,
    id: string,
    remove = false,
  ): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/transfers/downloads/${encodeURIComponent(username)}/${id}`,
      undefined,
      { remove },
    );
  }

  /** Clear all completed downloads */
  async clearCompletedDownloads(): Promise<void> {
    await this.request<void>('DELETE', '/transfers/downloads/all/completed');
  }

  /** Get a batch by ID */
  async getBatch(id: string): Promise<Batch> {
    return this.request<Batch>('GET', `/transfers/downloads/batches/${id}`);
  }

  // ────────────────────────────────────────────
  // Uploads
  // ────────────────────────────────────────────

  /** Get all uploads */
  async getUploads(includeRemoved = false): Promise<UserResponse[]> {
    return this.request<UserResponse[]>(
      'GET',
      '/transfers/uploads',
      undefined,
      { includeRemoved },
    );
  }

  /** Get uploads for a specific user */
  async getUserUploads(username: string): Promise<UserResponse> {
    return this.request<UserResponse>(
      'GET',
      `/transfers/uploads/${encodeURIComponent(username)}`,
    );
  }

  /** Get a specific upload */
  async getUpload(username: string, id: string): Promise<Transfer> {
    return this.request<Transfer>(
      'GET',
      `/transfers/uploads/${encodeURIComponent(username)}/${id}`,
    );
  }

  /** Cancel an upload */
  async cancelUpload(
    username: string,
    id: string,
    remove = false,
  ): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/transfers/uploads/${encodeURIComponent(username)}/${id}`,
      undefined,
      { remove },
    );
  }

  /** Clear all completed uploads */
  async clearCompletedUploads(): Promise<void> {
    await this.request<void>('DELETE', '/transfers/uploads/all/completed');
  }

  // ────────────────────────────────────────────
  // Users
  // ────────────────────────────────────────────

  /** Get user endpoint (IP address and port) */
  async getUserEndpoint(username: string): Promise<UserEndpoint> {
    return this.request<UserEndpoint>(
      'GET',
      `/users/${encodeURIComponent(username)}/endpoint`,
    );
  }

  /** Browse a user's shared files */
  async browseUser(username: string): Promise<unknown> {
    return this.request<unknown>(
      'GET',
      `/users/${encodeURIComponent(username)}/browse`,
    );
  }

  /** Get browse progress for a user */
  async getBrowseStatus(username: string): Promise<number> {
    return this.request<number>(
      'GET',
      `/users/${encodeURIComponent(username)}/browse/status`,
    );
  }

  /** Get contents of a specific directory from a user */
  async getUserDirectory(
    username: string,
    directory: string,
  ): Promise<unknown> {
    return this.request<unknown>(
      'POST',
      `/users/${encodeURIComponent(username)}/directory`,
      { directory },
    );
  }

  /** Get user info */
  async getUserInfo(username: string): Promise<UserInfo> {
    return this.request<UserInfo>(
      'GET',
      `/users/${encodeURIComponent(username)}/info`,
    );
  }

  /** Get user status */
  async getUserStatus(username: string): Promise<UserStatus> {
    return this.request<UserStatus>(
      'GET',
      `/users/${encodeURIComponent(username)}/status`,
    );
  }

  // ────────────────────────────────────────────
  // Shares (local)
  // ────────────────────────────────────────────

  /** List all local shares */
  async getShares(): Promise<Record<string, Share[]>> {
    return this.request<Record<string, Share[]>>('GET', '/shares');
  }

  /** Get a specific share by ID */
  async getShare(id: string): Promise<Share> {
    return this.request<Share>('GET', `/shares/${id}`);
  }

  /** Browse all shared contents */
  async browseShares(): Promise<unknown> {
    return this.request<unknown>('GET', '/shares/contents');
  }

  /** Browse a specific share's contents */
  async browseShare(id: string): Promise<unknown> {
    return this.request<unknown>('GET', `/shares/${id}/contents`);
  }

  /** Trigger a rescan of shares */
  async rescanShares(): Promise<void> {
    await this.request<void>('PUT', '/shares');
  }

  /** Cancel an ongoing share scan */
  async cancelShareScan(): Promise<void> {
    await this.request<void>('DELETE', '/shares');
  }

  // ────────────────────────────────────────────
  // Files (local downloads/incomplete)
  // ────────────────────────────────────────────

  /** List downloads directory contents */
  async listDownloads(recursive = false): Promise<FilesystemDirectory> {
    return this.request<FilesystemDirectory>(
      'GET',
      '/files/downloads/directories',
      undefined,
      { recursive },
    );
  }

  /** List a subdirectory within downloads */
  async listDownloadsSubdir(
    base64Subdir: string,
    recursive = false,
  ): Promise<FilesystemDirectory> {
    return this.request<FilesystemDirectory>(
      'GET',
      `/files/downloads/directories/${base64Subdir}`,
      undefined,
      { recursive },
    );
  }

  /** Delete a file in the downloads directory */
  async deleteDownloadFile(base64Filename: string): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/files/downloads/files/${base64Filename}`,
    );
  }

  /** Delete a subdirectory in the downloads directory */
  async deleteDownloadSubdir(base64Subdir: string): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/files/downloads/directories/${base64Subdir}`,
    );
  }

  /** List incomplete directory contents */
  async listIncomplete(recursive = false): Promise<FilesystemDirectory> {
    return this.request<FilesystemDirectory>(
      'GET',
      '/files/incomplete/directories',
      undefined,
      { recursive },
    );
  }

  // ────────────────────────────────────────────
  // Chat / Rooms
  // ────────────────────────────────────────────

  /** List all chat rooms */
  async getRooms(): Promise<Room[]> {
    return this.request<Room[]>('GET', '/rooms');
  }

  /** Join a chat room */
  async joinRoom(name: string): Promise<void> {
    await this.request<void>('PUT', `/rooms/${encodeURIComponent(name)}`);
  }

  /** Leave a chat room */
  async leaveRoom(name: string): Promise<void> {
    await this.request<void>('DELETE', `/rooms/${encodeURIComponent(name)}`);
  }

  /** Get messages from a room */
  async getRoomMessages(name: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(
      'GET',
      `/rooms/${encodeURIComponent(name)}/messages`,
    );
  }

  /** Send a message to a room */
  async sendRoomMessage(name: string, message: string): Promise<void> {
    await this.request<void>(
      'POST',
      `/rooms/${encodeURIComponent(name)}/messages`,
      { message },
    );
  }

  /** Get all private conversations */
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('GET', '/conversations');
  }

  /** Get a private conversation with a user */
  async getConversation(username: string): Promise<Conversation> {
    return this.request<Conversation>(
      'GET',
      `/conversations/${encodeURIComponent(username)}`,
    );
  }

  /** Send a private message to a user */
  async sendPrivateMessage(
    username: string,
    message: string,
  ): Promise<void> {
    await this.request<void>(
      'POST',
      `/conversations/${encodeURIComponent(username)}/messages`,
      { message },
    );
  }

  // ────────────────────────────────────────────
  // DownloadClient interface implementation
  // ────────────────────────────────────────────

  /**
   * Search for files on Soulseek.
   * This wraps the SLSKD search API and maps results to the generic SearchResult format.
   */
  async search(query: string, _options?: SearchOptions): Promise<SearchResult[]> {
    const search = await this.createSearch({
      searchText: query,
      searchTimeout: 15,
      responseLimit: 100,
      fileLimit: 10000,
    });

    // Wait a bit for results to accumulate, then fetch them
    await new Promise((r) => setTimeout(r, 3000));

    const searchWithResponses = await this.getSearch(search.id, true);
    const responses = searchWithResponses.responses ?? [];

    const results: SearchResult[] = [];
    for (const resp of responses) {
      for (const file of resp.files) {
        results.push({
          title: file.filename.split('\\').pop() ?? file.filename,
          url: `slsk://${resp.username}/${file.filename}`,
          fileSize: file.size,
          source: 'slskd',
          quality: file.bitRate ? `${file.bitRate}kbps` : undefined,
        });
      }
    }

    return results;
  }

  /**
   * Add a download from a search result.
   * The url format is: slsk://<username>/<filename>
   */
  async addDownload(url: string, _options?: DownloadOptions): Promise<string> {
    // Parse slsk://username/path/to/file
    const match = url.match(/^slsk:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid SLSKD URL: ${url}. Expected format: slsk://username/filename`);
    }

    const username = match[1];
    const filename = match[2];

    const response = await this.enqueueDownloadBatch({
      username,
      files: [{ filename, size: 0 }],
    });

    const batchId = response.batch.id;
    return batchId;
  }

  /**
   * Get download progress for a batch.
   * @param clientId - The batch ID returned by addDownload
   */
  async getProgress(clientId: string): Promise<DownloadProgress> {
    const batch = await this.getBatch(clientId);
    const transfers = batch.transfers ?? [];

    if (transfers.length === 0) {
      return {
        downloadId: clientId,
        progress: 0,
        speed: 0,
        eta: 0,
        fileSize: 0,
        downloaded: 0,
      };
    }

    const totalSize = transfers.reduce((sum, t) => sum + t.size, 0);
    const totalDownloaded = transfers.reduce((sum, t) => sum + t.bytesTransferred, 0);
    const avgSpeed = transfers.reduce((sum, t) => sum + t.averageSpeed, 0);
    const progress = totalSize > 0 ? (totalDownloaded / totalSize) * 100 : 0;

    // ETA: if speed > 0, remaining bytes / speed
    const remaining = totalSize - totalDownloaded;
    const eta = avgSpeed > 0 ? remaining / avgSpeed : 0;

    return {
      downloadId: clientId,
      progress: Math.min(progress, 100),
      speed: avgSpeed,
      eta,
      fileSize: totalSize,
      downloaded: totalDownloaded,
    };
  }

  /**
   * Cancel all transfers in a batch.
   */
  async cancel(clientId: string): Promise<void> {
    const batch = await this.getBatch(clientId);
    const transfers = batch.transfers ?? [];

    for (const t of transfers) {
      try {
        await this.cancelDownload(t.username, t.id, true);
      } catch {
        // continue cancelling others
      }
    }
  }

  /** Not supported by SLSKD (no pause/resume at API level) */
  async pause(_clientId: string): Promise<void> {
    throw new Error('SLSKD does not support pausing individual downloads');
  }

  /** Not supported by SLSKD */
  async resume(_clientId: string): Promise<void> {
    throw new Error('SLSKD does not support resuming individual downloads');
  }

  /** Remove all transfers in a batch */
  async remove(clientId: string): Promise<void> {
    const batch = await this.getBatch(clientId);
    const transfers = batch.transfers ?? [];

    for (const t of transfers) {
      try {
        await this.cancelDownload(t.username, t.id, true);
      } catch {
        // continue
      }
    }
  }

  /** Get overall SLSKD status */
  async getStatus(): Promise<DownloaderStatus> {
    try {
      const state = await this.getState();
      const server = state.server;
      return {
        connected: server.state === 'Connected' || server.state === 'LoggedIn',
        version: state.version.currentVersion,
        activeDownloads: undefined, // would need to fetch all downloads
      };
    } catch {
      return { connected: false };
    }
  }
}

export const slskd = new SlskdClient();
