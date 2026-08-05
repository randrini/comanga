import { ioRedis } from "@/lib/queue/connection";
import { downloadWorker } from "@/lib/queue/workers/download-worker";
import { metadataWorker } from "@/lib/queue/workers/metadata-worker";
import { maintenanceWorker } from "@/lib/queue/workers/maintenance-worker";

const SHUTDOWN_TIMEOUT_MS = 30_000;

/**
 * Gracefully close all workers and the Redis connection.
 * Call this during app shutdown (e.g. SIGTERM / SIGINT).
 */
async function shutdown(): Promise<void> {
  console.log("[queue] shutting down workers...");

  await Promise.allSettled([
    downloadWorker.close(),
    metadataWorker.close(),
    maintenanceWorker.close(),
  ]);

  console.log("[queue] workers closed, closing redis connection...");

  await ioRedis.quit();
}

/**
 * Register SIGTERM / SIGINT handlers that gracefully shut down workers and
 * Redis, then exit with code 0.  If shutdown takes longer than 30 seconds the
 * process is forcefully exited with code 1.
 */
export function registerShutdownHandlers(): void {
  const handler = async (signal: string) => {
    console.log(`[shutdown] received ${signal}, shutting down gracefully...`);

    const timer = setTimeout(() => {
      console.error(
        `[shutdown] forced exit after ${SHUTDOWN_TIMEOUT_MS}ms timeout`,
      );
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      await shutdown();
    } catch (err) {
      console.error("[shutdown] error during shutdown:", err);
    } finally {
      clearTimeout(timer);
      process.exit(0);
    }
  };

  process.on("SIGTERM", handler);
  process.on("SIGINT", handler);
}
