import { Worker, Job } from "bullmq";
import { MAINTENANCE_QUEUE } from "@/lib/queue/queues";
import { ioRedis } from "@/lib/queue/connection";

interface MaintenanceJobData {
  type: "sweep_stalled" | "sweep_dead" | "cache_cleanup";
  [key: string]: unknown;
}

const processor = async (job: Job<MaintenanceJobData>) => {
  const { type } = job.data;

  console.log(`[maintenance-worker] processing job ${job.id}`, {
    type,
    data: job.data,
  });

  switch (type) {
    case "sweep_stalled":
      // TODO: check for stalled downloads and retry
      console.log("[maintenance-worker] sweeping stalled downloads");
      break;
    case "sweep_dead":
      // TODO: remove dead requests
      console.log("[maintenance-worker] sweeping dead requests");
      break;
    case "cache_cleanup":
      // TODO: expire old metadata cache entries
      console.log("[maintenance-worker] cleaning up metadata cache");
      break;
    default:
      console.warn(`[maintenance-worker] unknown job type: ${type}`);
  }

  return { success: true, type };
};

export const maintenanceWorker = new Worker<MaintenanceJobData>(MAINTENANCE_QUEUE, processor, {
  connection: ioRedis,
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 1000,
  },
});

maintenanceWorker.on("completed", (job) => {
  console.log(`[maintenance-worker] job ${job.id} completed`);
});

maintenanceWorker.on("failed", (job, err) => {
  console.error(`[maintenance-worker] job ${job?.id} failed:`, err.message);
});

maintenanceWorker.on("error", (err) => {
  console.error("[maintenance-worker] worker error:", err.message);
});
