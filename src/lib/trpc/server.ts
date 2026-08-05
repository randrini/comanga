import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  series,
  volume,
  chapter,
  download,
  downloadSource,
  settings,
} from "@/lib/db/schema";
import { eq, and, or, like, desc, asc, sql, count } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import crypto from "crypto";

/**
 * Creates the tRPC context for each request.
 * Injects the database instance and request object.
 */
export const createTRPCContext = (opts: { req: Request }) => {
  return { db, req: opts.req };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context typing and superjson transformer.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const publicProcedure = t.procedure;
export const router = t.router;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function now(): number {
  return Date.now();
}

// ─── Series Router ─────────────────────────────────────────────────────────────

const seriesCreateSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(["manga", "manhwa", "comic", "light_novel", "novel"]),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  yearStart: z.number().int().optional(),
  yearEnd: z.number().int().optional(),
  metadataSource: z
    .enum(["comicvine", "mangadex", "anilist", "mangabaka"])
    .optional(),
  metadataId: z.string().optional(),
  monitored: z.boolean().optional(),
  monitorType: z.enum(["all", "new", "none"]).optional(),
  rootFolder: z.string().optional(),
});

const seriesUpdateSchema = seriesCreateSchema.partial().extend({
  status: z.enum(["ongoing", "completed", "hiatus", "unknown"]).optional(),
  notes: z.string().optional(),
});

const seriesListSchema = z.object({
  mediaType: z.enum(["manga", "manhwa", "comic", "light_novel", "novel"]).optional(),
  monitored: z.boolean().optional(),
  status: z.enum(["ongoing", "completed", "hiatus", "unknown"]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const seriesRouter = router({
  list: publicProcedure.input(seriesListSchema).query(async ({ input }) => {
    const { mediaType, monitored, status, limit, offset } = input;

    const filters: ReturnType<typeof eq>[] = [];
    if (mediaType) filters.push(eq(series.mediaType, mediaType));
    if (monitored !== undefined) filters.push(eq(series.monitored, monitored ? 1 : 0));
    if (status) filters.push(eq(series.status, status));

    const where = filters.length > 0 ? and(...filters) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(series)
      .where(where);

    const total = totalResult[0]?.count ?? 0;

    const rows = await db
      .select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        mediaType: series.mediaType,
        status: series.status,
        coverUrl: series.coverUrl,
        yearStart: series.yearStart,
        yearEnd: series.yearEnd,
        metadataSource: series.metadataSource,
        metadataId: series.metadataId,
        monitored: series.monitored,
        monitorType: series.monitorType,
        rootFolder: series.rootFolder,
        notes: series.notes,
        createdAt: series.createdAt,
        updatedAt: series.updatedAt,
        volumeCount: sql<number>`(SELECT count(*) FROM ${volume} WHERE ${volume.seriesId} = ${series.id})`,
      })
      .from(series)
      .where(where)
      .orderBy(desc(series.updatedAt))
      .limit(limit)
      .offset(offset);

    return { items: rows, total, limit, offset };
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select()
      .from(series)
      .where(eq(series.id, input))
      .limit(1);

    if (row.length === 0) return null;

    const s = row[0];

    const volumes = await db
      .select()
      .from(volume)
      .where(eq(volume.seriesId, input))
      .orderBy(asc(volume.volumeNumber));

    const chapters = await db
      .select()
      .from(chapter)
      .where(eq(chapter.seriesId, input))
      .orderBy(asc(chapter.chapterNumber));

    return { ...s, volumes, chapters };
  }),

  create: publicProcedure.input(seriesCreateSchema).query(async ({ input }) => {
    // Intentionally using query for mutation — will be migrated to mutation later
    const id = generateId();
    const ts = now();
    const slug = slugify(input.title);

    await db.insert(series).values({
      id,
      title: input.title,
      slug,
      mediaType: input.mediaType,
      description: input.description ?? null,
      coverUrl: input.coverUrl ?? null,
      yearStart: input.yearStart ?? null,
      yearEnd: input.yearEnd ?? null,
      metadataSource: input.metadataSource ?? null,
      metadataId: input.metadataId ?? null,
      monitored: input.monitored ? 1 : 0,
      monitorType: input.monitorType ?? "none",
      rootFolder: input.rootFolder ?? null,
      status: "unknown",
      notes: null,
      metadataSyncedAt: null,
      createdAt: ts,
      updatedAt: ts,
    });

    const created = await db
      .select()
      .from(series)
      .where(eq(series.id, id))
      .limit(1);

    return created[0] ?? null;
  }),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: seriesUpdateSchema }))
    .query(async ({ input }) => {
      const { id, data } = input;
      const ts = now();

      const updateData: Record<string, unknown> = { updatedAt: ts };

      if (data.title !== undefined) {
        updateData.title = data.title;
        updateData.slug = slugify(data.title);
      }
      if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
      if (data.yearStart !== undefined) updateData.yearStart = data.yearStart;
      if (data.yearEnd !== undefined) updateData.yearEnd = data.yearEnd;
      if (data.metadataSource !== undefined) updateData.metadataSource = data.metadataSource;
      if (data.metadataId !== undefined) updateData.metadataId = data.metadataId;
      if (data.monitored !== undefined) updateData.monitored = data.monitored ? 1 : 0;
      if (data.monitorType !== undefined) updateData.monitorType = data.monitorType;
      if (data.rootFolder !== undefined) updateData.rootFolder = data.rootFolder;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db.update(series).set(updateData).where(eq(series.id, id));

      const updated = await db
        .select()
        .from(series)
        .where(eq(series.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure.input(z.string()).query(async ({ input }) => {
    // Cascade delete: download sources -> downloads -> chapters -> volumes -> series
    // Delete download sources for this series' downloads
    const seriesDownloads = await db
      .select({ id: download.id })
      .from(download)
      .where(eq(download.seriesId, input));

    const downloadIds = seriesDownloads.map((d) => d.id);

    if (downloadIds.length > 0) {
      for (const did of downloadIds) {
        await db.delete(downloadSource).where(eq(downloadSource.downloadId, did));
      }
      for (const did of downloadIds) {
        await db.delete(download).where(eq(download.id, did));
      }
    }

    await db.delete(chapter).where(eq(chapter.seriesId, input));
    await db.delete(volume).where(eq(volume.seriesId, input));
    await db.delete(series).where(eq(series.id, input));

    return { success: true, id: input };
  }),

  toggleMonitor: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select({ monitored: series.monitored })
      .from(series)
      .where(eq(series.id, input))
      .limit(1);

    if (row.length === 0) return null;

    const newMonitored = row[0].monitored ? 0 : 1;
    await db
      .update(series)
      .set({ monitored: newMonitored, updatedAt: now() })
      .where(eq(series.id, input));

    const updated = await db
      .select()
      .from(series)
      .where(eq(series.id, input))
      .limit(1);

    return updated[0] ?? null;
  }),

  searchMetadata: publicProcedure
    .input(
      z.object({
        query: z.string(),
        source: z.enum(["comicvine", "mangadex", "anilist", "mangabaka"]).optional(),
      })
    )
    .query(async () => {
      // Stub — will be wired to external metadata sources later
      return [];
    }),
});

// ─── Volume Router ──────────────────────────────────────────────────────────────

const volumeCreateSchema = z.object({
  seriesId: z.string().min(1),
  volumeNumber: z.number().int().min(1),
  title: z.string().optional(),
  coverUrl: z.string().optional(),
  metadataSource: z
    .enum(["comicvine", "mangadex", "anilist", "mangabaka"])
    .optional(),
  metadataId: z.string().optional(),
  releasedAt: z.number().int().optional(),
});

const volumeUpdateSchema = volumeCreateSchema.partial();

const volumeRouter = router({
  list: publicProcedure
    .input(
      z.object({
        seriesId: z.string(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { seriesId, limit, offset } = input;

      const totalResult = await db
        .select({ count: count() })
        .from(volume)
        .where(eq(volume.seriesId, seriesId));

      const total = totalResult[0]?.count ?? 0;

      const items = await db
        .select()
        .from(volume)
        .where(eq(volume.seriesId, seriesId))
        .orderBy(asc(volume.volumeNumber))
        .limit(limit)
        .offset(offset);

      return { items, total, limit, offset };
    }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select()
      .from(volume)
      .where(eq(volume.id, input))
      .limit(1);

    return row[0] ?? null;
  }),

  create: publicProcedure.input(volumeCreateSchema).query(async ({ input }) => {
    const id = generateId();
    const ts = now();

    await db.insert(volume).values({
      id,
      seriesId: input.seriesId,
      volumeNumber: input.volumeNumber,
      title: input.title ?? null,
      coverUrl: input.coverUrl ?? null,
      metadataSource: input.metadataSource ?? null,
      metadataId: input.metadataId ?? null,
      releasedAt: input.releasedAt ?? null,
      createdAt: ts,
      updatedAt: ts,
    });

    const created = await db
      .select()
      .from(volume)
      .where(eq(volume.id, id))
      .limit(1);

    return created[0] ?? null;
  }),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: volumeUpdateSchema }))
    .query(async ({ input }) => {
      const { id, data } = input;
      const ts = now();

      const updateData: Record<string, unknown> = { updatedAt: ts };

      if (data.seriesId !== undefined) updateData.seriesId = data.seriesId;
      if (data.volumeNumber !== undefined) updateData.volumeNumber = data.volumeNumber;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
      if (data.metadataSource !== undefined) updateData.metadataSource = data.metadataSource;
      if (data.metadataId !== undefined) updateData.metadataId = data.metadataId;
      if (data.releasedAt !== undefined) updateData.releasedAt = data.releasedAt;

      await db.update(volume).set(updateData).where(eq(volume.id, id));

      const updated = await db
        .select()
        .from(volume)
        .where(eq(volume.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure.input(z.string()).query(async ({ input }) => {
    // Delete chapters referencing this volume first
    await db.delete(chapter).where(eq(chapter.volumeId, input));
    await db.delete(volume).where(eq(volume.id, input));
    return { success: true, id: input };
  }),
});

// ─── Chapter Router ────────────────────────────────────────────────────────────

const chapterCreateSchema = z.object({
  seriesId: z.string().min(1),
  volumeId: z.string().optional(),
  chapterNumber: z.number().optional(),
  title: z.string().optional(),
  pages: z.number().int().optional(),
  releasedAt: z.number().int().optional(),
});

const chapterUpdateSchema = chapterCreateSchema.partial();

const chapterRouter = router({
  list: publicProcedure
    .input(
      z.object({
        seriesId: z.string().optional(),
        volumeId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { seriesId, volumeId, limit, offset } = input;

      const filters: ReturnType<typeof eq>[] = [];
      if (seriesId) filters.push(eq(chapter.seriesId, seriesId));
      if (volumeId) filters.push(eq(chapter.volumeId, volumeId));

      const where = filters.length > 0 ? and(...filters) : undefined;

      const totalResult = await db
        .select({ count: count() })
        .from(chapter)
        .where(where);

      const total = totalResult[0]?.count ?? 0;

      const items = await db
        .select()
        .from(chapter)
        .where(where)
        .orderBy(asc(chapter.chapterNumber))
        .limit(limit)
        .offset(offset);

      return { items, total, limit, offset };
    }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, input))
      .limit(1);

    return row[0] ?? null;
  }),

  create: publicProcedure.input(chapterCreateSchema).query(async ({ input }) => {
    const id = generateId();
    const ts = now();

    await db.insert(chapter).values({
      id,
      seriesId: input.seriesId,
      volumeId: input.volumeId ?? null,
      chapterNumber: input.chapterNumber ?? null,
      title: input.title ?? null,
      pages: input.pages ?? null,
      releasedAt: input.releasedAt ?? null,
      createdAt: ts,
      updatedAt: ts,
    });

    const created = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, id))
      .limit(1);

    return created[0] ?? null;
  }),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: chapterUpdateSchema }))
    .query(async ({ input }) => {
      const { id, data } = input;
      const ts = now();

      const updateData: Record<string, unknown> = { updatedAt: ts };

      if (data.seriesId !== undefined) updateData.seriesId = data.seriesId;
      if (data.volumeId !== undefined) updateData.volumeId = data.volumeId;
      if (data.chapterNumber !== undefined) updateData.chapterNumber = data.chapterNumber;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.pages !== undefined) updateData.pages = data.pages;
      if (data.releasedAt !== undefined) updateData.releasedAt = data.releasedAt;

      await db.update(chapter).set(updateData).where(eq(chapter.id, id));

      const updated = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure.input(z.string()).query(async ({ input }) => {
    await db.delete(chapter).where(eq(chapter.id, input));
    return { success: true, id: input };
  }),
});

// ─── Download Router ───────────────────────────────────────────────────────────

const downloadCreateSchema = z.object({
  seriesId: z.string().min(1),
  volumeId: z.string().optional(),
  chapterId: z.string().optional(),
  downloaderType: z.enum([
    "slskd",
    "prowlarr_torrent",
    "prowlarr_usenet",
    "getcomics",
    "comicscode",
  ]),
  autoSearch: z.boolean().optional(),
});

const downloadUpdateSchema = z.object({
  status: z
    .enum([
      "pending",
      "searching",
      "downloading",
      "verifying",
      "importing",
      "completed",
      "failed",
      "awaiting_release",
      "stalled",
      "blocked",
      "manual_search",
    ])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  errorMessage: z.string().optional(),
  downloadUrl: z.string().optional(),
  downloadPath: z.string().optional(),
  fileSize: z.number().int().optional(),
  priority: z.number().int().optional(),
  maxRetries: z.number().int().optional(),
  completedAt: z.number().int().optional(),
});

const downloadListSchema = z.object({
  seriesId: z.string().optional(),
  status: z
    .enum([
      "pending",
      "searching",
      "downloading",
      "verifying",
      "importing",
      "completed",
      "failed",
      "awaiting_release",
      "stalled",
      "blocked",
      "manual_search",
    ])
    .optional(),
  downloaderType: z
    .enum(["slskd", "prowlarr_torrent", "prowlarr_usenet", "getcomics", "comicscode"])
    .optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const downloadRouter = router({
  list: publicProcedure.input(downloadListSchema).query(async ({ input }) => {
    const { seriesId, status, downloaderType, limit, offset } = input;

    const filters: ReturnType<typeof eq>[] = [];
    if (seriesId) filters.push(eq(download.seriesId, seriesId));
    if (status) filters.push(eq(download.status, status));
    if (downloaderType) filters.push(eq(download.downloaderType, downloaderType));

    const where = filters.length > 0 ? and(...filters) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(download)
      .where(where);

    const total = totalResult[0]?.count ?? 0;

    const items = await db
      .select()
      .from(download)
      .where(where)
      .orderBy(desc(download.priority), desc(download.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total, limit, offset };
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select()
      .from(download)
      .where(eq(download.id, input))
      .limit(1);

    if (row.length === 0) return null;

    const sources = await db
      .select()
      .from(downloadSource)
      .where(eq(downloadSource.downloadId, input))
      .orderBy(desc(downloadSource.score));

    return { ...row[0], sources };
  }),

  create: publicProcedure.input(downloadCreateSchema).query(async ({ input }) => {
    const id = generateId();
    const ts = now();

    await db.insert(download).values({
      id,
      seriesId: input.seriesId,
      volumeId: input.volumeId ?? null,
      chapterId: input.chapterId ?? null,
      downloaderType: input.downloaderType,
      status: "pending",
      autoSearch: input.autoSearch ? 1 : 1,
      retryCount: 0,
      maxRetries: 3,
      priority: 0,
      progress: null,
      downloadUrl: null,
      downloadPath: null,
      fileSize: null,
      errorMessage: null,
      blockedAt: null,
      completedAt: null,
      createdAt: ts,
      updatedAt: ts,
    });

    const created = await db
      .select()
      .from(download)
      .where(eq(download.id, id))
      .limit(1);

    return created[0] ?? null;
  }),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: downloadUpdateSchema }))
    .query(async ({ input }) => {
      const { id, data } = input;
      const ts = now();

      const updateData: Record<string, unknown> = { updatedAt: ts };

      if (data.status !== undefined) updateData.status = data.status;
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;
      if (data.downloadUrl !== undefined) updateData.downloadUrl = data.downloadUrl;
      if (data.downloadPath !== undefined) updateData.downloadPath = data.downloadPath;
      if (data.fileSize !== undefined) updateData.fileSize = data.fileSize;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.maxRetries !== undefined) updateData.maxRetries = data.maxRetries;
      if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;

      // Auto-set completedAt when status changes to completed
      if (data.status === "completed" && data.completedAt === undefined) {
        updateData.completedAt = ts;
      }

      await db.update(download).set(updateData).where(eq(download.id, id));

      const updated = await db
        .select()
        .from(download)
        .where(eq(download.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure.input(z.string()).query(async ({ input }) => {
    await db.delete(downloadSource).where(eq(downloadSource.downloadId, input));
    await db.delete(download).where(eq(download.id, input));
    return { success: true, id: input };
  }),

  retry: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select({ retryCount: download.retryCount })
      .from(download)
      .where(eq(download.id, input))
      .limit(1);

    if (row.length === 0) return null;

    const ts = now();
    await db
      .update(download)
      .set({
        status: "pending",
        retryCount: row[0].retryCount + 1,
        errorMessage: null,
        progress: null,
        updatedAt: ts,
      })
      .where(eq(download.id, input));

    const updated = await db
      .select()
      .from(download)
      .where(eq(download.id, input))
      .limit(1);

    return updated[0] ?? null;
  }),

  block: publicProcedure.input(z.string()).query(async ({ input }) => {
    const ts = now();
    await db
      .update(download)
      .set({
        status: "blocked",
        blockedAt: ts,
        updatedAt: ts,
      })
      .where(eq(download.id, input));

    const updated = await db
      .select()
      .from(download)
      .where(eq(download.id, input))
      .limit(1);

    return updated[0] ?? null;
  }),

  searchSources: publicProcedure
    .input(z.object({ downloadId: z.string() }))
    .query(async () => {
      // Stub — will be wired to actual downloader source search later
      return [];
    }),
});

// ─── Settings Router ──────────────────────────────────────────────────────────

const settingsRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, input))
      .limit(1);

    return row[0] ?? null;
  }),

  set: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .query(async ({ input }) => {
      const { key, value } = input;

      // Upsert: try insert, on conflict update
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } });

      const row = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      return row[0] ?? null;
    }),

  getAll: publicProcedure.query(async () => {
    const rows = await db.select().from(settings);
    return rows;
  }),
});

// ─── Metadata Router (stub) ───────────────────────────────────────────────────

const metadataRouter = router({
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        source: z.enum(["comicvine", "mangadex", "anilist", "mangabaka"]).optional(),
      })
    )
    .query(async () => {
      // Stub — will be wired to external metadata sources later
      return [];
    }),

  getSeries: publicProcedure
    .input(
      z.object({
        source: z.enum(["comicvine", "mangadex", "anilist", "mangabaka"]),
        sourceId: z.string(),
      })
    )
    .query(async () => {
      // Stub — will be wired to external metadata sources later
      return null;
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  series: seriesRouter,
  volume: volumeRouter,
  chapter: chapterRouter,
  download: downloadRouter,
  settings: settingsRouter,
  metadata: metadataRouter,
});

export type AppRouter = typeof appRouter;
