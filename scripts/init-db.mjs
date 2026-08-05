/**
 * Comanga — Database initializer
 *
 * Standalone ESM script that creates tables and seeds demo data.
 * Runs on first container startup via docker-entrypoint.sh.
 * Uses better-sqlite3 directly (no TypeScript/drizzle dependencies).
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = process.env.DATABASE_URL || "./data/comanga.db";

// Ensure data directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// ─── Schema ──────────────────────────────────────────────────────────────────

function createTables() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      media_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unknown',
      cover_url TEXT,
      year_start INTEGER,
      year_end INTEGER,
      metadata_source TEXT,
      metadata_id TEXT,
      metadata_synced_at INTEGER,
      monitored INTEGER NOT NULL DEFAULT 0,
      monitor_type TEXT NOT NULL DEFAULT 'none',
      root_folder TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(metadata_source, metadata_id)
    );

    CREATE TABLE IF NOT EXISTS volume (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
      volume_number INTEGER NOT NULL,
      title TEXT,
      cover_url TEXT,
      metadata_source TEXT,
      metadata_id TEXT,
      released_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS volume_series_id_idx ON volume(series_id);

    CREATE TABLE IF NOT EXISTS chapter (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
      volume_id TEXT REFERENCES volume(id) ON DELETE CASCADE,
      chapter_number REAL,
      title TEXT,
      pages INTEGER,
      released_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS chapter_series_id_idx ON chapter(series_id);
    CREATE INDEX IF NOT EXISTS chapter_volume_id_idx ON chapter(volume_id);

    CREATE TABLE IF NOT EXISTS download (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
      volume_id TEXT REFERENCES volume(id) ON DELETE CASCADE,
      chapter_id TEXT REFERENCES chapter(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      downloader_type TEXT NOT NULL,
      download_url TEXT,
      download_path TEXT,
      file_size INTEGER,
      progress REAL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      max_retries INTEGER NOT NULL DEFAULT 3,
      error_message TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      auto_search INTEGER NOT NULL DEFAULT 1,
      blocked_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS download_series_id_idx ON download(series_id);
    CREATE INDEX IF NOT EXISTS download_status_idx ON download(status);
    CREATE INDEX IF NOT EXISTS download_status_priority_idx ON download(status, priority);

    CREATE TABLE IF NOT EXISTS download_source (
      id TEXT PRIMARY KEY,
      download_id TEXT NOT NULL REFERENCES download(id) ON DELETE CASCADE,
      downloader_type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      file_size INTEGER,
      seeders INTEGER,
      leechers INTEGER,
      score REAL,
      selected INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS download_source_download_id_idx ON download_source(download_id);

    CREATE TABLE IF NOT EXISTS metadata_cache (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      data_type TEXT NOT NULL,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      UNIQUE(source, source_id, data_type)
    );

    CREATE TABLE IF NOT EXISTS blocklist (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
      title TEXT,
      downloader_type TEXT,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS blocklist_series_id_idx ON blocklist(series_id);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloader_config (
      id TEXT PRIMARY KEY,
      downloader_type TEXT NOT NULL UNIQUE,
      enabled INTEGER NOT NULL DEFAULT 1,
      config TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

// ─── Seed data ────────────────────────────────────────────────────────────────

function seed() {
  const count = sqlite.prepare("SELECT COUNT(*) as c FROM series").get();
  if (count.c > 0) {
    console.log("[init] Database already has data, skipping seed.");
    return;
  }

  console.log("[init] Seeding demo data...");
  const now = Date.now();
  const day = 86400000;

  const insertSeries = sqlite.prepare(`
    INSERT INTO series (id, title, slug, description, media_type, status, year_start, year_end, metadata_source, metadata_id, monitored, monitor_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVolume = sqlite.prepare(`
    INSERT INTO volume (id, series_id, volume_number, title, released_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertChapter = sqlite.prepare(`
    INSERT INTO chapter (id, series_id, volume_id, chapter_number, title, pages, released_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDownload = sqlite.prepare(`
    INSERT INTO download (id, series_id, volume_id, status, downloader_type, file_size, progress, retry_count, max_retries, error_message, priority, auto_search, created_at, updated_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDownloadSource = sqlite.prepare(`
    INSERT INTO download_source (id, download_id, downloader_type, title, url, file_size, seeders, leechers, score, selected, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBlocklist = sqlite.prepare(`
    INSERT INTO blocklist (id, series_id, title, downloader_type, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertSetting = sqlite.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
  `);

  const insertDownloaderConfig = sqlite.prepare(`
    INSERT INTO downloader_config (id, downloader_type, enabled, config, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMetadataCache = sqlite.prepare(`
    INSERT INTO metadata_cache (id, source, source_id, data_type, data, fetched_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const series = [
    {
      id: "sr-1", title: "One Piece", slug: "one-piece",
      desc: "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever: the legendary One Piece.",
      type: "manga", status: "ongoing", year: 1997, yearEnd: null, source: "mangadex", srcId: "a1c7c817-4e59-43b7-9365-09675a149a6f", monitored: 1, monitorType: "all",
      volumes: [
        { n: 1, t: "Romance Dawn", r: now - day * 9000, ch: [{ n: 1, t: "Romance Dawn", p: 53 }, { n: 2, t: "That Guy, Straw Hat Luffy", p: 21 }, { n: 3, t: "Introducing Zoro", p: 23 }] },
        { n: 2, t: "Versus the Black Cat Pirates", r: now - day * 8700, ch: [{ n: 4, t: "The Black Cat Pirates", p: 19 }, { n: 5, t: "Captain Kuro", p: 21 }, { n: 6, t: "The Plan", p: 23 }] },
        { n: 3, t: "Don't Get Caught", r: now - day * 8400, ch: [{ n: 7, t: "Don't Get Caught", p: 21 }, { n: 8, t: "Nami", p: 19 }, { n: 9, t: "The Lie", p: 23 }] },
        { n: 4, t: "The Black Cat Pirates", r: now - day * 8100, ch: [{ n: 10, t: "The Black Cat Pirates", p: 21 }, { n: 11, t: "The Conspiracy", p: 19 }, { n: 12, t: "The End", p: 23 }] },
        { n: 5, t: "For Whom the Bell Tolls", r: now - day * 7800, ch: [{ n: 13, t: "For Whom the Bell Tolls", p: 21 }, { n: 14, t: "The Challenge", p: 19 }, { n: 15, t: "The Duel", p: 23 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 157286400 },
        { s: "completed", dt: "slskd", p: 100, fs: 142606400 },
        { s: "downloading", dt: "slskd", p: 67, fs: 188743680 },
        { s: "queued", dt: "slskd", p: 0, fs: 0 },
      ],
    },
    {
      id: "sr-2", title: "Berserk", slug: "berserk",
      desc: "Guts, a former mercenary now known as the Black Swordsman, seeks revenge against the God Hand and their apostles who branded him for sacrifice.",
      type: "manga", status: "hiatus", year: 1989, yearEnd: null, source: "mangadex", srcId: "801513ba-a712-498c-8f57-cae55b38cc92", monitored: 1, monitorType: "new",
      volumes: [
        { n: 1, t: "The Black Swordsman", r: now - day * 10000, ch: [{ n: 1, t: "The Black Swordsman", p: 28 }, { n: 2, t: "The Brand", p: 24 }, { n: 3, t: "Guardians of Desire", p: 26 }] },
        { n: 2, t: "The Holy Iron Chain Knights", r: now - day * 9700, ch: [{ n: 4, t: "The Holy Iron Chain Knights", p: 24 }, { n: 5, t: "The Wind of Swords", p: 22 }, { n: 6, t: "The Beast of Darkness", p: 26 }] },
        { n: 3, t: "The Guardian of Desire", r: now - day * 9400, ch: [{ n: 7, t: "The Guardian of Desire", p: 24 }, { n: 8, t: "The Eclipse", p: 28 }, { n: 9, t: "The Aftermath", p: 22 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 134217728 },
        { s: "completed", dt: "slskd", p: 100, fs: 120795955 },
        { s: "stalled", dt: "slskd", p: 42, fs: 83886080 },
      ],
    },
    {
      id: "sr-3", title: "Invincible", slug: "invincible",
      desc: "Mark Grayson is a normal teenager except for the fact that his father is the most powerful superhero on the planet.",
      type: "comic", status: "completed", year: 2003, yearEnd: 2018, source: "comicvine", srcId: "4050-18049", monitored: 0, monitorType: "none",
      volumes: [
        { n: 1, t: "Family Matters", r: now - day * 7000, ch: [{ n: 1, t: "Family Matters", p: 24 }, { n: 2, t: "The Hard Way", p: 22 }, { n: 3, t: "Who You Calling Ugly?", p: 20 }] },
        { n: 2, t: "Eight Is Enough", r: now - day * 6700, ch: [{ n: 4, t: "Eight Is Enough", p: 22 }, { n: 5, t: "The New Guard", p: 24 }, { n: 6, t: "The Old Guard", p: 20 }] },
        { n: 3, t: "Perfect Strangers", r: now - day * 6400, ch: [{ n: 7, t: "Perfect Strangers", p: 22 }, { n: 8, t: "The Other Side", p: 24 }, { n: 9, t: "The Truth", p: 26 }] },
      ],
      dls: [
        { s: "completed", dt: "getcomics", p: 100, fs: 104857600 },
        { s: "completed", dt: "getcomics", p: 100, fs: 98566144 },
      ],
    },
    {
      id: "sr-4", title: "Solo Leveling", slug: "solo-leveling",
      desc: "In a world where hunters must battle deadly monsters, the weakest hunter Sung Jin-Woo gains a strange power that allows him to level up endlessly.",
      type: "manhwa", status: "completed", year: 2018, yearEnd: 2023, source: "mangadex", srcId: "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0", monitored: 1, monitorType: "all",
      volumes: [
        { n: 1, t: "The Weakest", r: now - day * 2000, ch: [{ n: 1, t: "The Weakest", p: 12 }, { n: 2, t: "The Double Dungeon", p: 14 }, { n: 3, t: "The System", p: 12 }] },
        { n: 2, t: "The Awakening", r: now - day * 1800, ch: [{ n: 4, t: "The Awakening", p: 12 }, { n: 5, t: "The Quest", p: 14 }, { n: 6, t: "The Gate", p: 12 }] },
        { n: 3, t: "The Shadow Monarch", r: now - day * 1600, ch: [{ n: 7, t: "The Shadow Monarch", p: 12 }, { n: 8, t: "The Army", p: 14 }, { n: 9, t: "The Battle", p: 16 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 73400320 },
        { s: "completed", dt: "slskd", p: 100, fs: 69206016 },
        { s: "completed", dt: "slskd", p: 100, fs: 75497472 },
      ],
    },
    {
      id: "sr-5", title: "Chainsaw Man", slug: "chainsaw-man",
      desc: "Denji is a young man trapped in poverty, working off his debt by hunting devils. When he's betrayed and killed, his devil-dog Pochita merges with his body, granting him the power to transform into Chainsaw Man.",
      type: "manga", status: "ongoing", year: 2018, yearEnd: null, source: "mangadex", srcId: "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b", monitored: 1, monitorType: "all",
      volumes: [
        { n: 1, t: "Dog & Chainsaw", r: now - day * 1500, ch: [{ n: 1, t: "Dog & Chainsaw", p: 48 }, { n: 2, t: "The Place Where Pochita Is", p: 20 }, { n: 3, t: "The Arrival in Tokyo", p: 22 }] },
        { n: 2, t: "Chainsaw vs. Bat", r: now - day * 1300, ch: [{ n: 4, t: "Chainsaw vs. Bat", p: 20 }, { n: 5, t: "The Leash", p: 22 }, { n: 6, t: "The Taste of a Kiss", p: 20 }] },
        { n: 3, t: "Kill Denji", r: now - day * 1100, ch: [{ n: 7, t: "Kill Denji", p: 22 }, { n: 8, t: "The Gun Devil", p: 20 }, { n: 9, t: "The Curse", p: 24 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 52428800 },
        { s: "downloading", dt: "slskd", p: 83, fs: 50331648 },
        { s: "queued", dt: "slskd", p: 0, fs: 0 },
      ],
    },
    {
      id: "sr-6", title: "Tower of God", slug: "tower-of-god",
      desc: "Twenty-Fifth Bam had been alone his whole life until he met Rachel. When Rachel enters the mysterious Tower, Bam follows her, determined to stay by her side no matter what.",
      type: "manhwa", status: "ongoing", year: 2010, yearEnd: null, source: "mangadex", srcId: "f9c7fe32-31d9-4b1c-bb2b-0d4e3f1e8b2a", monitored: 1, monitorType: "new",
      volumes: [
        { n: 1, t: "The Floor of Test", r: now - day * 4000, ch: [{ n: 1, t: "The Floor of Test", p: 16 }, { n: 2, t: "The Choice", p: 14 }, { n: 3, t: "The Test", p: 18 }] },
        { n: 2, t: "The Crown Game", r: now - day * 3800, ch: [{ n: 4, t: "The Crown Game", p: 16 }, { n: 5, t: "The Alliance", p: 14 }, { n: 6, t: "The Betrayal", p: 18 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 41943040 },
        { s: "failed", dt: "slskd", p: 12, fs: 5242880 },
      ],
    },
    {
      id: "sr-7", title: "Vagabond", slug: "vagabond",
      desc: "Growing up in 17th century Japan, Shinmen Takezo is shunned by his village for his wild nature. He seeks to become the greatest swordsman in the land.",
      type: "manga", status: "hiatus", year: 1998, yearEnd: null, source: "mangadex", srcId: "b8e2d1a3-7f45-4c9e-a1b2-3d6e8f0c4a5b", monitored: 0, monitorType: "none",
      volumes: [
        { n: 1, t: "The Legend of the Musashi", r: now - day * 8000, ch: [{ n: 1, t: "The Legend of the Musashi", p: 32 }, { n: 2, t: "The Demon", p: 28 }, { n: 3, t: "The Way of the Sword", p: 30 }] },
        { n: 2, t: "The Way of the Sword", r: now - day * 7700, ch: [{ n: 4, t: "The Way of the Sword", p: 28 }, { n: 5, t: "The Duel", p: 32 }, { n: 6, t: "The Aftermath", p: 26 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 89128960 },
      ],
    },
    {
      id: "sr-8", title: "The Walking Dead", slug: "the-walking-dead",
      desc: "Rick Grimes wakes from a coma to a world overrun by zombies. He must lead a group of survivors through a post-apocalyptic landscape.",
      type: "comic", status: "completed", year: 2003, yearEnd: 2019, source: "comicvine", srcId: "4050-18166", monitored: 0, monitorType: "none",
      volumes: [
        { n: 1, t: "Days Gone Bye", r: now - day * 7000, ch: [{ n: 1, t: "Days Gone Bye", p: 22 }, { n: 2, t: "The Road", p: 20 }, { n: 3, t: "The Farm", p: 24 }] },
        { n: 2, t: "Miles Behind Us", r: now - day * 6700, ch: [{ n: 4, t: "Miles Behind Us", p: 22 }, { n: 5, t: "The Prison", p: 20 }, { n: 6, t: "The Governor", p: 24 }] },
      ],
      dls: [
        { s: "completed", dt: "getcomics", p: 100, fs: 115343360 },
      ],
    },
    {
      id: "sr-9", title: "Sword Art Online", slug: "sword-art-online",
      desc: "In the near future, a Virtual Reality MMORPG called Sword Art Online is released. Players soon discover they cannot log out, and death in the game means death in the real world.",
      type: "light_novel", status: "ongoing", year: 2009, yearEnd: null, source: "anilist", srcId: "21400", monitored: 1, monitorType: "all",
      volumes: [
        { n: 1, t: "Aincrad", r: now - day * 5000, ch: [{ n: 1, t: "Aincrad", p: 40 }, { n: 2, t: "The Floor Boss", p: 35 }, { n: 3, t: "The Duel", p: 38 }] },
        { n: 2, t: "Aincrad Part 2", r: now - day * 4700, ch: [{ n: 4, t: "Aincrad Part 2", p: 38 }, { n: 5, t: "The Murder Case", p: 35 }, { n: 6, t: "The Truth", p: 40 }] },
      ],
      dls: [
        { s: "completed", dt: "slskd", p: 100, fs: 31457280 },
        { s: "queued", dt: "slskd", p: 0, fs: 0 },
      ],
    },
    {
      id: "sr-10", title: "Batman: The Long Halloween", slug: "batman-the-long-halloween",
      desc: "When a mysterious killer strikes on every holiday, Batman must use his intellect and detective skills to uncover the identity of Holiday before the next holiday arrives.",
      type: "comic", status: "completed", year: 1996, yearEnd: 1997, source: "comicvine", srcId: "4050-18071", monitored: 0, monitorType: "none",
      volumes: [
        { n: 1, t: "The Long Halloween Part 1", r: now - day * 9000, ch: [{ n: 1, t: "The Long Halloween Part 1", p: 24 }, { n: 2, t: "The Long Halloween Part 2", p: 22 }, { n: 3, t: "The Long Halloween Part 3", p: 24 }] },
        { n: 2, t: "The Long Halloween Part 2", r: now - day * 8700, ch: [{ n: 4, t: "The Long Halloween Part 4", p: 24 }, { n: 5, t: "The Long Halloween Part 5", p: 22 }, { n: 6, t: "The Long Halloween Part 6", p: 24 }] },
      ],
      dls: [],
    },
  ];

  const seedAll = sqlite.transaction(() => {
    for (const s of series) {
      const createdAt = now - Math.random() * day * 30;
      const updatedAt = now - Math.random() * day * 7;
      insertSeries.run(s.id, s.title, s.slug, s.desc, s.type, s.status, s.year, s.yearEnd, s.source, s.srcId, s.monitored, s.monitorType, createdAt, updatedAt);

      for (const v of s.volumes) {
        const volId = `${s.id}-vol-${v.n}`;
        insertVolume.run(volId, s.id, v.n, v.t, v.r, v.r, v.r);

        for (const ch of v.ch) {
          const chId = `${volId}-ch-${ch.n}`;
          insertChapter.run(chId, s.id, volId, ch.n, ch.t, ch.p, v.r + ch.n * day * 7, v.r + ch.n * day * 7, v.r + ch.n * day * 7);
        }
      }

      for (let i = 0; i < s.dls.length; i++) {
        const d = s.dls[i];
        const vol = s.volumes[i % s.volumes.length];
        const volId = `${s.id}-vol-${vol.n}`;
        const dlId = `${s.id}-dl-${i + 1}`;
        const completedAt = d.s === "completed" ? now - day * (s.dls.length - i) * 1 : null;

        insertDownload.run(dlId, s.id, volId, d.s, d.dt, d.fs, d.p, 0, 3, null, 0, 1, now - day * (s.dls.length - i) * 3, now - day * (s.dls.length - i) * 1, completedAt);

        if (d.s !== "queued") {
          insertDownloadSource.run(`${dlId}-src-1`, dlId, d.dt, `${s.title} Vol. ${vol.n}`, `https://example.com/download/${s.slug}/vol-${vol.n}`, d.fs, Math.floor(Math.random() * 50) + 10, Math.floor(Math.random() * 10) + 1, Math.random() * 5, 1, now - day * s.dls.length);
        }
      }
    }

    // Blocklist
    insertBlocklist.run("bl-1", "sr-6", "Tower of God - Fake Release Vol. 5", "slskd", "Malicious file detected", now - day * 10);
    insertBlocklist.run("bl-2", "sr-2", "Berserk - Low Quality Scan Vol. 4", "slskd", "Quality below minimum threshold", now - day * 5);

    // Settings
    insertSetting.run("download_directory", "/media/comics");
    insertSetting.run("auto_queue_monitored", "true");
    insertSetting.run("max_concurrent_downloads", "3");
    insertSetting.run("retry_limit", "3");
    insertSetting.run("media_root", "./media");

    // Downloader configs
    insertDownloaderConfig.run("dc-slskd", "slskd", 1, JSON.stringify({ url: "http://slskd:5030", apiKey: "" }), 1, now - day * 30, now - day * 7);
    insertDownloaderConfig.run("dc-getcomics", "getcomics", 1, JSON.stringify({ enabled: true }), 2, now - day * 30, now - day * 7);
    insertDownloaderConfig.run("dc-prowlarr", "prowlarr", 0, JSON.stringify({ url: "", apiKey: "" }), 3, now - day * 30, now - day * 7);

    // Metadata cache
    insertMetadataCache.run("mc-1", "mangadex", "a1c7c817-4e59-43b7-9365-09675a149a6f", "series", JSON.stringify({ title: "One Piece" }), now - day * 3, now + day * 4);
  });

  seedAll();
  console.log("[init] Seed complete: 10 series, 27 volumes, 81 chapters, 21 downloads");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log("[init] Initializing database...");
createTables();
seed();
sqlite.close();
console.log("[init] Database ready.");
