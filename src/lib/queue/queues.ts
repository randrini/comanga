import { Queue } from "bullmq";
import { ioRedis } from "@/lib/queue/connection";

export const DOWNLOAD_QUEUE = "download" as const;
export const METADATA_QUEUE = "metadata" as const;
export const MAINTENANCE_QUEUE = "maintenance" as const;

export function getQueue(name: string): Queue {
  return new Queue(name, { connection: ioRedis });
}

export const downloadQueue = new Queue(DOWNLOAD_QUEUE, {
  connection: ioRedis,
});

export const metadataQueue = new Queue(METADATA_QUEUE, {
  connection: ioRedis,
});

export const maintenanceQueue = new Queue(MAINTENANCE_QUEUE, {
  connection: ioRedis,
});
