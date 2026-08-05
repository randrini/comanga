import { Worker, Job } from "bullmq";
import { METADATA_QUEUE } from "@/lib/queue/queues";
import { ioRedis } from "@/lib/queue/connection";

interface MetadataJobData {
  seriesId: string;
  type: "refresh_series" | "refresh_chapters" | "search_metadata";
  [key: string]: unknown;
}

const processor = async (job: Job<MetadataJobData>) => {
  const { type, seriesId } = job.data;

  console.log(`[metadata-worker] processing job ${job.id}`, {
    type,
    seriesId,
    data: job.data,
  });

  switch (type) {
    case "refresh_series":
      // TODO: implement series metadata refresh
      console.log(`[metadata-worker] refreshing series metadata for ${seriesId}`);
      break;
    case "refresh_chapters":
      // TODO: implement chapter list refresh
      console.log(`[metadata-worker] refreshing chapter list for ${seriesId}`);
      break;
    case "search_metadata":
      // TODO: implement metadata search
      console.log(`[metadata-worker] searching metadata sources for ${seriesId}`);
      break;
    default:
      console.warn(`[metadata-worker] unknown job type: ${type}`);
  }

  return { success: true, type, seriesId };
};

export const metadataWorker = new Worker<MetadataJobData>(METADATA_QUEUE, processor, {
  connection: ioRedis,
  concurrency: 2,
  limiter: {
    max: 2,
    duration: 1000,
  },
});

metadataWorker.on("completed", (job) => {
  console.log(`[metadata-worker] job ${job.id} completed`);
});

metadataWorker.on("failed", (job, err) => {
  console.error(`[metadata-worker] job ${job?.id} failed:`, err.message);
});

metadataWorker.on("error", (err) => {
  console.error("[metadata-worker] worker error:", err.message);
});
