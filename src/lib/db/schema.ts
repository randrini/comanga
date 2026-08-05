import { sqliteTable, text, integer, real, index, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm/relations";

// ─── Series ───────────────────────────────────────────────────────────────────

export const series = sqliteTable(
  "series",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    mediaType: text("media_type").notNull(), // manga|manhwa|comic|light_novel|novel
    status: text("status").notNull().default("unknown"), // ongoing|completed|hiatus|unknown
    coverUrl: text("cover_url"),
    yearStart: integer("year_start"),
    yearEnd: integer("year_end"),
    metadataSource: text("metadata_source"), // comicvine|mangadex|anilist|mangabaka
    metadataId: text("metadata_id"),
    metadataSyncedAt: integer("metadata_synced_at"),
    monitored: integer("monitored").notNull().default(0),
    monitorType: text("monitor_type").notNull().default("none"), // all|new|none
    rootFolder: text("root_folder"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    slugUnique: unique("series_slug_unique").on(table.slug),
    metadataSourceIdUnique: unique("series_metadata_source_id_unique").on(
      table.metadataSource,
      table.metadataId
    ),
  })
);

// ─── Volume ───────────────────────────────────────────────────────────────────

export const volume = sqliteTable(
  "volume",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    volumeNumber: integer("volume_number").notNull(),
    title: text("title"),
    coverUrl: text("cover_url"),
    metadataSource: text("metadata_source"),
    metadataId: text("metadata_id"),
    releasedAt: integer("released_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    seriesIdIdx: index("volume_series_id_idx").on(table.seriesId),
  })
);

// ─── Chapter ──────────────────────────────────────────────────────────────────

export const chapter = sqliteTable(
  "chapter",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    volumeId: text("volume_id").references(() => volume.id, { onDelete: "cascade" }),
    chapterNumber: real("chapter_number"),
    title: text("title"),
    pages: integer("pages"),
    releasedAt: integer("released_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    seriesIdIdx: index("chapter_series_id_idx").on(table.seriesId),
    volumeIdIdx: index("chapter_volume_id_idx").on(table.volumeId),
  })
);

// ─── Download ─────────────────────────────────────────────────────────────────

export const download = sqliteTable(
  "download",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    volumeId: text("volume_id").references(() => volume.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id").references(() => chapter.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending|searching|downloading|verifying|importing|completed|failed|awaiting_release|stalled|blocked|manual_search
    downloaderType: text("downloader_type").notNull(), // slskd|prowlarr_torrent|prowlarr_usenet|getcomics|comicscode
    downloadUrl: text("download_url"),
    downloadPath: text("download_path"),
    fileSize: integer("file_size"),
    progress: real("progress"),
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    errorMessage: text("error_message"),
    priority: integer("priority").notNull().default(0),
    autoSearch: integer("auto_search").notNull().default(1),
    blockedAt: integer("blocked_at"),
    completedAt: integer("completed_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    seriesIdIdx: index("download_series_id_idx").on(table.seriesId),
    statusIdx: index("download_status_idx").on(table.status),
    statusPriorityIdx: index("download_status_priority_idx").on(
      table.status,
      table.priority
    ),
  })
);

// ─── Download Source ──────────────────────────────────────────────────────────

export const downloadSource = sqliteTable(
  "download_source",
  {
    id: text("id").primaryKey(),
    downloadId: text("download_id")
      .notNull()
      .references(() => download.id, { onDelete: "cascade" }),
    downloaderType: text("downloader_type").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    fileSize: integer("file_size"),
    seeders: integer("seeders"),
    leechers: integer("leechers"),
    score: real("score"),
    selected: integer("selected").default(0),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    downloadIdIdx: index("download_source_download_id_idx").on(table.downloadId),
  })
);

// ─── Metadata Cache ───────────────────────────────────────────────────────────

export const metadataCache = sqliteTable(
  "metadata_cache",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(), // comicvine|mangadex|anilist|mangabaka
    sourceId: text("source_id").notNull(),
    dataType: text("data_type").notNull(), // series|volume|chapter|search
    data: text("data").notNull(), // JSON string
    fetchedAt: integer("fetched_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    sourceSourceIdDataTypeUnique: unique(
      "metadata_cache_source_source_id_data_type_unique"
    ).on(table.source, table.sourceId, table.dataType),
  })
);

// ─── Blocklist ─────────────────────────────────────────────────────────────────

export const blocklist = sqliteTable(
  "blocklist",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    title: text("title"),
    downloaderType: text("downloader_type"),
    reason: text("reason"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    seriesIdIdx: index("blocklist_series_id_idx").on(table.seriesId),
  })
);

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── Downloader Config ────────────────────────────────────────────────────────

export const downloaderConfig = sqliteTable(
  "downloader_config",
  {
    id: text("id").primaryKey(),
    downloaderType: text("downloader_type").notNull(),
    enabled: integer("enabled").notNull().default(1),
    config: text("config").notNull(), // JSON string
    priority: integer("priority").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    downloaderTypeUnique: unique("downloader_config_type_unique").on(
      table.downloaderType
    ),
  })
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const seriesRelations = relations(series, ({ many }) => ({
  volumes: many(volume),
  chapters: many(chapter),
  downloads: many(download),
  blocklistEntries: many(blocklist),
}));

export const volumeRelations = relations(volume, ({ one, many }) => ({
  series: one(series, {
    fields: [volume.seriesId],
    references: [series.id],
  }),
  chapters: many(chapter),
  downloads: many(download),
}));

export const chapterRelations = relations(chapter, ({ one, many }) => ({
  series: one(series, {
    fields: [chapter.seriesId],
    references: [series.id],
  }),
  volume: one(volume, {
    fields: [chapter.volumeId],
    references: [volume.id],
  }),
  downloads: many(download),
}));

export const downloadRelations = relations(download, ({ one, many }) => ({
  series: one(series, {
    fields: [download.seriesId],
    references: [series.id],
  }),
  volume: one(volume, {
    fields: [download.volumeId],
    references: [volume.id],
  }),
  chapter: one(chapter, {
    fields: [download.chapterId],
    references: [chapter.id],
  }),
  sources: many(downloadSource),
}));

export const downloadSourceRelations = relations(downloadSource, ({ one }) => ({
  download: one(download, {
    fields: [downloadSource.downloadId],
    references: [download.id],
  }),
}));

export const metadataCacheRelations = relations(metadataCache, () => ({}));

export const blocklistRelations = relations(blocklist, ({ one }) => ({
  series: one(series, {
    fields: [blocklist.seriesId],
    references: [series.id],
  }),
}));

export const settingsRelations = relations(settings, () => ({}));

export const downloaderConfigRelations = relations(downloaderConfig, () => ({}));

// ─── Schema Object ────────────────────────────────────────────────────────────

export const schema = {
  series,
  volume,
  chapter,
  download,
  downloadSource,
  metadataCache,
  blocklist,
  settings,
  downloaderConfig,
};
