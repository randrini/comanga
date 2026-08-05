import { ioRedis } from "@/lib/queue/connection";
import {
  downloadQueue,
  metadataQueue,
  maintenanceQueue,
  DOWNLOAD_QUEUE,
  METADATA_QUEUE,
  MAINTENANCE_QUEUE,
} from "@/lib/queue/queues";
import { downloadWorker } from "@/lib/queue/workers/download-worker";
import { metadataWorker } from "@/lib/queue/workers/metadata-worker";
import { maintenanceWorker } from "@/lib/queue/workers/maintenance-worker";

// -- Queue helpers -----------------------------------------------------------

/**
 * Add a job to the download queue.
 */
export async function addDownloadJob(
  downloadId: string,
  type: string,
  priority?: number,
) {
  return downloadQueue.add(type, { downloadId, type }, { priority });
}

/**
 * Add a job to the metadata queue.
 */
export async function addMetadataJob(seriesId: string, type: string) {
  return metadataQueue.add(type, { seriesId, type });
}

/**
 * Add a job to the maintenance queue.
 */
export async function addMaintenanceJob(type: string) {
  return maintenanceQueue.add(type, { type });
}

// -- Graceful shutdown ------------------------------------------------------

/**
 * Gracefully close all workers and the Redis connection.
 * Call this during app shutdown (e.g. SIGTERM / SIGINT).
 */
export async function shutdown(): Promise<void> {
  console.log("[queue] shutting down workers...");

  await Promise.allSettled([
    downloadWorker.close(),
    metadataWorker.close(),
    maintenanceWorker.close(),
  ]);

  console.log("[queue] workers closed, closing redis connection...");

  await ioRedis.quit();
}

// -- Re-exports -------------------------------------------------------------

export { ioRedis } from "@/lib/queue/connection";
export {
  downloadQueue,
  metadataQueue,
  maintenanceQueue,
  DOWNLOAD_QUEUE,
  METADATA_QUEUE,
  MAINTENANCE_QUEUE,
} from "@/lib/queue/queues";
export { downloadWorker } from "@/lib/queue/workers/download-worker";
export { metadataWorker } from "@/lib/queue/workers/metadata-worker";
export { maintenanceWorker } from "@/lib/queue/workers/maintenance-worker";
