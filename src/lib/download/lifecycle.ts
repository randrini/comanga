/**
 * Download lifecycle state machine.
 *
 * Defines valid status transitions, retry logic with exponential backoff,
 * and helper predicates for the Comanga download pipeline.
 *
 * Flow:
 *   pending → searching → downloading → verifying → importing → completed
 *                                       ↓
 *                                    stalled → (retry) → searching
 *                                       ↓
 *                                    failed → (retry) → pending → searching ...
 *                                       ↓
 *                                    blocked
 *
 *   pending → manual_search → (manual selection) → downloading ...
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type DownloadStatus =
  | "pending"
  | "queued"
  | "searching"
  | "downloading"
  | "verifying"
  | "importing"
  | "completed"
  | "failed"
  | "awaiting_release"
  | "stalled"
  | "blocked"
  | "manual_search";

export interface LifecycleTransition {
  from: DownloadStatus;
  to: DownloadStatus;
  action: string;
}

export interface LifecycleState {
  status: DownloadStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  lastAttemptAt?: number;
  nextAttemptAt?: number;
}

// ─── Transitions Map ─────────────────────────────────────────────────────────

/**
 * Maps each status to the list of statuses it may validly transition to.
 */
export const TRANSITIONS: Record<DownloadStatus, DownloadStatus[]> = {
  pending: ["searching", "manual_search", "blocked", "queued"],
  searching: ["downloading", "manual_search", "failed", "awaiting_release", "blocked"],
  downloading: ["verifying", "failed", "stalled", "blocked"],
  verifying: ["importing", "failed", "blocked"],
  importing: ["completed", "failed"],
  completed: [], // terminal
  failed: ["pending", "blocked"], // can retry or block
  awaiting_release: ["pending", "blocked"], // release detected, re-queue
  stalled: ["searching", "failed", "blocked"], // can retry search or give up
  blocked: [], // terminal – manual unblock required
  manual_search: ["downloading", "blocked"],
  queued: ["pending"], // queue processor picks it up
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check whether a transition from one status to another is valid.
 */
export function canTransition(from: DownloadStatus, to: DownloadStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Perform a state transition and return a new LifecycleState.
 *
 * - Validates the transition (throws on invalid).
 * - Resets `retryCount` on forward progress (searching → downloading → …).
 * - Increments `retryCount` on failure/stall transitions.
 * - Sets `lastError`, `lastAttemptAt`, and `nextAttemptAt` as appropriate.
 */
export function transition(
  download: LifecycleState,
  toStatus: DownloadStatus,
  error?: string,
): LifecycleState {
  if (!canTransition(download.status, toStatus)) {
    throw new Error(
      `Invalid transition: ${download.status} → ${toStatus}`,
    );
  }

  const now = Date.now();
  const isForwardProgress =
    (download.status === "searching" && toStatus === "downloading") ||
    (download.status === "downloading" && toStatus === "verifying") ||
    (download.status === "verifying" && toStatus === "importing") ||
    (download.status === "importing" && toStatus === "completed");

  const isRetryableFailure =
    toStatus === "failed" || toStatus === "stalled";

  const isRetry =
    toStatus === "pending" || toStatus === "searching";

  let retryCount = download.retryCount;

  if (isForwardProgress) {
    // Forward progress resets the retry counter
    retryCount = 0;
  } else if (isRetryableFailure) {
    // Failure/stall increments retry count
    retryCount += 1;
  }
  // Retry transitions (pending/searching) keep the current retryCount

  const nextAttemptAt =
    isRetry || isRetryableFailure
      ? now + getNextAttemptDelay(retryCount)
      : undefined;

  return {
    ...download,
    status: toStatus,
    retryCount,
    lastError: error ?? download.lastError,
    lastAttemptAt: now,
    nextAttemptAt,
  };
}

/**
 * Exponential backoff delays (in ms):
 *   0 retries →  30s
 *   1 retry  →  60s
 *   2 retries → 120s
 *   3 retries → 300s
 *   4+ retries → 600s
 */
const BACKOFF_DELAYS = [30_000, 60_000, 120_000, 300_000, 600_000];

/**
 * Return the delay in milliseconds before the next retry attempt.
 */
export function getNextAttemptDelay(retryCount: number): number {
  if (retryCount >= BACKOFF_DELAYS.length) {
    return BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
  }
  return BACKOFF_DELAYS[retryCount];
}

/**
 * Whether the download can be retried (retryCount < maxRetries).
 */
export function shouldRetry(download: LifecycleState): boolean {
  return download.retryCount < download.maxRetries;
}

/**
 * Whether the status is a terminal state (no further transitions possible).
 */
export function isTerminal(status: DownloadStatus): boolean {
  return TRANSITIONS[status]?.length === 0;
}

/**
 * Whether the status represents an active in-progress state.
 */
export function isActive(status: DownloadStatus): boolean {
  return (
    status === "searching" ||
    status === "downloading" ||
    status === "verifying" ||
    status === "importing"
  );
}
