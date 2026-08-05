import { Worker, Job } from "bullmq";
import { DOWNLOAD_QUEUE } from "@/lib/queue/queues";
import { ioRedis } from "@/lib/queue/connection";

interface DownloadJobData {
  downloadId: string;
  type: "search" | "download" | "verify" | "import";
  [key: string]: unknown;
}

const processor = async (job: Job<DownloadJobData>) => {
  const { type, downloadId } = job.data;

  console.log(`[download-worker] processing job ${job.id}`, {
    type,
    downloadId,
    data: job.data,
  });

  switch (type) {
    case "search":
      // TODO: implement search logic
      console.log(`[download-worker] search source for download ${downloadId}`);
      break;
    case "download":
      // TODO: implement download logic
      console.log(`[download-worker] downloading file for ${downloadId}`);
      break;
    case "verify":
      // TODO: implement verification logic
      console.log(`[download-worker] verifying download ${downloadId}`);
      break;
    case "import":
      // TODO: implement import logic
      console.log(`[download-worker] importing download ${downloadId} to library`);
      break;
    default:
      console.warn(`[download-worker] unknown job type: ${type}`);
  }

  return { success: true, type, downloadId };
};

export const downloadWorker = new Worker<DownloadJobData>(DOWNLOAD_QUEUE, processor, {
  connection: ioRedis,
  concurrency: 3,
  limiter: {
    max: 3,
    duration: 1000,
  },
});

downloadWorker.on("completed", (job) => {
  console.log(`[download-worker] job ${job.id} completed`);
});

downloadWorker.on("failed", (job, err) => {
  console.error(`[download-worker] job ${job?.id} failed:`, err.message);
});

downloadWorker.on("error", (err) => {
  console.error("[download-worker] worker error:", err.message);
});
