/**
 * Download orchestration engine.
 *
 * Coordinates the state machine, database, downloader clients, and queue
 * workers to drive the full download lifecycle.
 *
 * Each public method is a self-contained pipeline step.  Method bodies are
 * stubbed with "Not implemented" — they will be wired up when the concrete
 * downloader integrations are built.
 */

import { db } from "@/lib/db";
import { download } from "@/lib/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import {
  canTransition,
  transition,
  shouldRetry,
  type DownloadStatus,
  type LifecycleState,
} from "./lifecycle";
import { addDownloadJob } from "@/lib/queue";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a DB download row to a LifecycleState.
 */
function toLifecycleState(row: typeof download.$inferSelect): LifecycleState {
  return {
    status: row.status as DownloadStatus,
    retryCount: row.retryCount,
    maxRetries: row.maxRetries,
    lastError: row.errorMessage ?? undefined,
    lastAttemptAt: row.updatedAt ?? undefined,
    nextAttemptAt: undefined,
  };
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class DownloadEngine {
  /**
   * Process a pending download: search sources and select best result.
   *
   * 1. Fetch download from DB
   * 2. Get the series to construct search query
   * 3. Search using configured downloader(s)
   * 4. Score and select best result
   * 5. Initiate download via the selected downloader
   * 6. Update download status to 'downloading'
   */
  async processPending(_downloadId: string): Promise<void> {
    // TODO: Implement with real downloader calls
    throw new Error("Not implemented: DownloadEngine.processPending");
  }

  /**
   * Check progress of an active download.
   *
   * 1. Fetch download from DB
   * 2. Query downloader for progress
   * 3. Update progress in DB
   * 4. If complete, transition to 'verifying'
   */
  async checkProgress(_downloadId: string): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented: DownloadEngine.checkProgress");
  }

  /**
   * Verify a downloaded file.
   *
   * 1. Check file exists and is a valid archive
   * 2. Match against expected series/volume/chapter
   * 3. If valid, transition to 'importing'
   * 4. If invalid, transition to 'failed'
   */
  async verify(_downloadId: string): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented: DownloadEngine.verify");
  }

  /**
   * Import a verified download into the library.
   *
   * 1. Move/rename file to library location
   * 2. Update series root folder
   * 3. Transition to 'completed'
   */
  async importDownload(_downloadId: string): Promise<void> {
    // TODO: Implement
    throw new Error("Not implemented: DownloadEngine.importDownload");
  }

  /**
   * Retry a failed or stalled download.
   *
   * 1. Check if retry is possible (retryCount < maxRetries)
   * 2. Transition to 'pending'
   * 3. Enqueue new search job
   */
  async retry(downloadId: string): Promise<void> {
    const [row] = await db
      .select()
      .from(download)
      .where(eq(download.id, downloadId))
      .limit(1);

    if (!row) {
      throw new Error(`Download not found: ${downloadId}`);
    }

    const state = toLifecycleState(row);

    if (!shouldRetry(state)) {
      throw new Error(
        `Download ${downloadId} has exhausted retries (${state.retryCount}/${state.maxRetries})`,
      );
    }

    if (!canTransition(state.status, "pending")) {
      throw new Error(
        `Cannot retry download ${downloadId} from status ${state.status}`,
      );
    }

    const next = transition(state, "pending");

    await db
      .update(download)
      .set({
        status: next.status,
        retryCount: next.retryCount,
        errorMessage: null,
        updatedAt: Date.now(),
      })
      .where(eq(download.id, downloadId));

    await addDownloadJob(downloadId, "search", row.priority);
  }

  /**
   * Block a download permanently.
   *
   * 1. Transition to 'blocked'
   * 2. Update in DB with reason
   */
  async block(downloadId: string, reason?: string): Promise<void> {
    const [row] = await db
      .select()
      .from(download)
      .where(eq(download.id, downloadId))
      .limit(1);

    if (!row) {
      throw new Error(`Download not found: ${downloadId}`);
    }

    const state = toLifecycleState(row);

    if (!canTransition(state.status, "blocked")) {
      throw new Error(
        `Cannot block download ${downloadId} from status ${state.status}`,
      );
    }

    const next = transition(state, "blocked", reason);

    await db
      .update(download)
      .set({
        status: next.status,
        errorMessage: reason ?? next.lastError,
        blockedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(download.id, downloadId));
  }

  /**
   * Sweep stalled downloads and retry them.
   *
   * 1. Find all downloads with status 'stalled' or 'downloading' with no
   *    progress for 30 minutes
   * 2. For each, check if retry is possible
   * 3. Retry or fail them
   *
   * @returns The number of downloads that were swept.
   */
  async sweepStalled(): Promise<number> {
    const staleThreshold = Date.now() - 30 * 60 * 1000;

    const stalled = await db
      .select()
      .from(download)
      .where(
        and(
          eq(download.status, "stalled"),
          lt(download.updatedAt, staleThreshold),
        ),
      );

    const stuck = await db
      .select()
      .from(download)
      .where(
        and(
          eq(download.status, "downloading"),
          lt(download.updatedAt, staleThreshold),
        ),
      );

    const candidates = [...stalled, ...stuck];
    let swept = 0;

    for (const row of candidates) {
      const state = toLifecycleState(row);

      if (shouldRetry(state)) {
        // Retry by transitioning through stalled → searching
        const next = transition(state, "searching");
        await db
          .update(download)
          .set({
            status: next.status,
            retryCount: next.retryCount,
            updatedAt: Date.now(),
          })
          .where(eq(download.id, row.id));

        await addDownloadJob(row.id, "search", row.priority);
      } else {
        // Exhausted retries — fail permanently
        const next = transition(state, "failed", "Stalled and retries exhausted");
        await db
          .update(download)
          .set({
            status: next.status,
            retryCount: next.retryCount,
            errorMessage: next.lastError,
            updatedAt: Date.now(),
          })
          .where(eq(download.id, row.id));
      }

      swept += 1;
    }

    return swept;
  }

  /**
   * Sweep dead / awaiting downloads that will never complete.
   *
   * 1. Find downloads stuck in 'failed' with maxRetries exceeded
   * 2. Transition to 'blocked'
   *
   * @returns The number of downloads that were swept.
   */
  async sweepDead(): Promise<number> {
    const dead = await db
      .select()
      .from(download)
      .where(
        and(
          eq(download.status, "failed"),
          sql`${download.retryCount} >= ${download.maxRetries}`,
        ),
      );

    let swept = 0;

    for (const row of dead) {
      const state = toLifecycleState(row);

      if (!canTransition(state.status, "blocked")) {
        continue;
      }

      const next = transition(state, "blocked", "Max retries exceeded");

      await db
        .update(download)
        .set({
          status: next.status,
          errorMessage: next.lastError,
          blockedAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(eq(download.id, row.id));

      swept += 1;
    }

    return swept;
  }
}

export const downloadEngine = new DownloadEngine();
