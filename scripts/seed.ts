/**
 * Comanga — Database seed script
 *
 * Populates the database with rich mock data so the UI renders real content.
 *
 * Usage: npx tsx scripts/seed.ts
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/lib/db/schema";
import { randomUUID } from "crypto";

const DB_PATH = process.env.DATABASE_URL || "./data/comanga.db";

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

const now = Date.now();
const day = 86400000;

// ─── Series data ──────────────────────────────────────────────────────────────

interface SeriesSeed {
  id: string;
  title: string;
  slug: string;
  description: string;
  mediaType: string;
  status: string;
  yearStart: number;
  yearEnd: number | null;
  metadataSource: string;
  metadataId: string;
  monitored: number;
  monitorType: string;
  volumes: { number: number; title: string; releasedAt: number; chapters: { number: number; title: string; pages: number }[] }[];
  downloads: { status: string; downloaderType: string; progress: number; fileSize: number; retryCount: number; errorMessage: string | null }[];
}

const seriesData: SeriesSeed[] = [
  {
    id: "sr-1",
    title: "One Piece",
    slug: "one-piece",
    description:
      "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever: the legendary One Piece. Along the way, they face powerful enemies, forge unbreakable bonds, and discover the true meaning of freedom on the high seas.",
    mediaType: "manga",
    status: "ongoing",
    yearStart: 1997,
    yearEnd: null,
    metadataSource: "mangadex",
    metadataId: "a1c7c817-4e59-43b7-9365-09675a149a6f",
    monitored: 1,
    monitorType: "all",
    volumes: [
      { number: 1, title: "Romance Dawn", releasedAt: now - day * 9000, chapters: [{ number: 1, title: "Romance Dawn", pages: 53 }, { number: 2, title: "That Guy, Straw Hat Luffy", pages: 21 }, { number: 3, title: "Introducing Zoro", pages: 23 }] },
      { number: 2, title: "Versus the Black Cat Pirates", releasedAt: now - day * 8700, chapters: [{ number: 4, title: "The Black Cat Pirates", pages: 19 }, { number: 5, title: "Captain Kuro", pages: 21 }, { number: 6, title: "The Plan", pages: 23 }] },
      { number: 3, title: "Don't Get Caught", releasedAt: now - day * 8400, chapters: [{ number: 7, title: "Don't Get Caught", pages: 21 }, { number: 8, title: "Nami", pages: 19 }, { number: 9, title: "The Lie", pages: 23 }] },
      { number: 4, title: "The Black Cat Pirates", releasedAt: now - day * 8100, chapters: [{ number: 10, title: "The Black Cat Pirates", pages: 21 }, { number: 11, title: "The Conspiracy", pages: 19 }, { number: 12, title: "The End", pages: 23 }] },
      { number: 5, title: "For Whom the Bell Tolls", releasedAt: now - day * 7800, chapters: [{ number: 13, title: "For Whom the Bell Tolls", pages: 21 }, { number: 14, title: "The Challenge", pages: 19 }, { number: 15, title: "The Duel", pages: 23 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 157286400, retryCount: 0, errorMessage: null },
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 142606400, retryCount: 0, errorMessage: null },
      { status: "downloading", downloaderType: "slskd", progress: 67, fileSize: 188743680, retryCount: 0, errorMessage: null },
      { status: "queued", downloaderType: "slskd", progress: 0, fileSize: 0, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-2",
    title: "Berserk",
    slug: "berserk",
    description:
      "Guts, a former mercenary now known as the Black Swordsman, seeks revenge against the God Hand and their apostles who branded him for sacrifice. A dark fantasy epic of struggle, survival, and the indomitable human spirit.",
    mediaType: "manga",
    status: "hiatus",
    yearStart: 1989,
    yearEnd: null,
    metadataSource: "mangadex",
    metadataId: "801513ba-a712-498c-8f57-cae55b38cc92",
    monitored: 1,
    monitorType: "new",
    volumes: [
      { number: 1, title: "The Black Swordsman", releasedAt: now - day * 10000, chapters: [{ number: 1, title: "The Black Swordsman", pages: 28 }, { number: 2, title: "The Brand", pages: 24 }, { number: 3, title: "Guardians of Desire", pages: 26 }] },
      { number: 2, title: "The Holy Iron Chain Knights", releasedAt: now - day * 9700, chapters: [{ number: 4, title: "The Holy Iron Chain Knights", pages: 24 }, { number: 5, title: "The Wind of Swords", pages: 22 }, { number: 6, title: "The Beast of Darkness", pages: 26 }] },
      { number: 3, title: "The Guardian of Desire", releasedAt: now - day * 9400, chapters: [{ number: 7, title: "The Guardian of Desire", pages: 24 }, { number: 8, title: "The Eclipse", pages: 28 }, { number: 9, title: "The Aftermath", pages: 22 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 134217728, retryCount: 0, errorMessage: null },
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 120795955, retryCount: 0, errorMessage: null },
      { status: "stalled", downloaderType: "slskd", progress: 42, fileSize: 83886080, retryCount: 2, errorMessage: "Connection timed out" },
    ],
  },
  {
    id: "sr-3",
    title: "Invincible",
    slug: "invincible",
    description:
      "Mark Grayson is a normal teenager except for the fact that his father is the most powerful superhero on the planet. When Mark inherits his father's powers, he must learn to balance his personal life with the responsibilities of being a hero.",
    mediaType: "comic",
    status: "completed",
    yearStart: 2003,
    yearEnd: 2018,
    metadataSource: "comicvine",
    metadataId: "4050-18049",
    monitored: 0,
    monitorType: "none",
    volumes: [
      { number: 1, title: "Family Matters", releasedAt: now - day * 7000, chapters: [{ number: 1, title: "Family Matters", pages: 24 }, { number: 2, title: "The Hard Way", pages: 22 }, { number: 3, title: "Who You Calling Ugly?", pages: 20 }] },
      { number: 2, title: "Eight Is Enough", releasedAt: now - day * 6700, chapters: [{ number: 4, title: "Eight Is Enough", pages: 22 }, { number: 5, title: "The New Guard", pages: 24 }, { number: 6, title: "The Old Guard", pages: 20 }] },
      { number: 3, title: "Perfect Strangers", releasedAt: now - day * 6400, chapters: [{ number: 7, title: "Perfect Strangers", pages: 22 }, { number: 8, title: "The Other Side", pages: 24 }, { number: 9, title: "The Truth", pages: 26 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "getcomics", progress: 100, fileSize: 104857600, retryCount: 0, errorMessage: null },
      { status: "completed", downloaderType: "getcomics", progress: 100, fileSize: 98566144, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-4",
    title: "Solo Leveling",
    slug: "solo-leveling",
    description:
      "In a world where hunters must battle deadly monsters, the weakest hunter Sung Jin-Woo gains a strange power that allows him to level up endlessly. What starts as a struggle for survival becomes an epic journey of power and discovery.",
    mediaType: "manhwa",
    status: "completed",
    yearStart: 2018,
    yearEnd: 2023,
    metadataSource: "mangadex",
    metadataId: "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
    monitored: 1,
    monitorType: "all",
    volumes: [
      { number: 1, title: "The Weakest", releasedAt: now - day * 2000, chapters: [{ number: 1, title: "The Weakest", pages: 12 }, { number: 2, title: "The Double Dungeon", pages: 14 }, { number: 3, title: "The System", pages: 12 }] },
      { number: 2, title: "The Awakening", releasedAt: now - day * 1800, chapters: [{ number: 4, title: "The Awakening", pages: 12 }, { number: 5, title: "The Quest", pages: 14 }, { number: 6, title: "The Gate", pages: 12 }] },
      { number: 3, title: "The Shadow Monarch", releasedAt: now - day * 1600, chapters: [{ number: 7, title: "The Shadow Monarch", pages: 12 }, { number: 8, title: "The Army", pages: 14 }, { number: 9, title: "The Battle", pages: 16 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 73400320, retryCount: 0, errorMessage: null },
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 69206016, retryCount: 0, errorMessage: null },
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 75497472, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-5",
    title: "Chainsaw Man",
    slug: "chainsaw-man",
    description:
      "Denji is a young man trapped in poverty, working off his deceased father's debt to the yakuza by hunting devils with his pet devil-dog Pochita. When he's betrayed and killed, Pochita merges with his body, granting him the power to transform into Chainsaw Man.",
    mediaType: "manga",
    status: "ongoing",
    yearStart: 2018,
    yearEnd: null,
    metadataSource: "mangadex",
    metadataId: "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b",
    monitored: 1,
    monitorType: "all",
    volumes: [
      { number: 1, title: "Dog & Chainsaw", releasedAt: now - day * 1500, chapters: [{ number: 1, title: "Dog & Chainsaw", pages: 48 }, { number: 2, title: "The Place Where Pochita Is", pages: 20 }, { number: 3, title: "The Arrival in Tokyo", pages: 22 }] },
      { number: 2, title: "Chainsaw vs. Bat", releasedAt: now - day * 1300, chapters: [{ number: 4, title: "Chainsaw vs. Bat", pages: 20 }, { number: 5, title: "The Leash", pages: 22 }, { number: 6, title: "The Taste of a Kiss", pages: 20 }] },
      { number: 3, title: "Kill Denji", releasedAt: now - day * 1100, chapters: [{ number: 7, title: "Kill Denji", pages: 22 }, { number: 8, title: "The Gun Devil", pages: 20 }, { number: 9, title: "The Curse", pages: 24 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 52428800, retryCount: 0, errorMessage: null },
      { status: "downloading", downloaderType: "slskd", progress: 83, fileSize: 50331648, retryCount: 0, errorMessage: null },
      { status: "queued", downloaderType: "slskd", progress: 0, fileSize: 0, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-6",
    title: "Tower of God",
    slug: "tower-of-god",
    description:
      "Twenty-Fifth Bam had been alone his whole life until he met Rachel. When Rachel enters the mysterious Tower, Bam follows her, determined to stay by her side no matter what. The Tower tests its climbers with deadly challenges and impossible choices.",
    mediaType: "manhwa",
    status: "ongoing",
    yearStart: 2010,
    yearEnd: null,
    metadataSource: "mangadex",
    metadataId: "f9c7fe32-31d9-4b1c-bb2b-0d4e3f1e8b2a",
    monitored: 1,
    monitorType: "new",
    volumes: [
      { number: 1, title: "The Floor of Test", releasedAt: now - day * 4000, chapters: [{ number: 1, title: "The Floor of Test", pages: 16 }, { number: 2, title: "The Choice", pages: 14 }, { number: 3, title: "The Test", pages: 18 }] },
      { number: 2, title: "The Crown Game", releasedAt: now - day * 3800, chapters: [{ number: 4, title: "The Crown Game", pages: 16 }, { number: 5, title: "The Alliance", pages: 14 }, { number: 6, title: "The Betrayal", pages: 18 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 41943040, retryCount: 0, errorMessage: null },
      { status: "failed", downloaderType: "slskd", progress: 12, fileSize: 5242880, retryCount: 3, errorMessage: "File not found on remote host" },
    ],
  },
  {
    id: "sr-7",
    title: "Vagabond",
    slug: "vagabond",
    description:
      "Growing up in 17th century Japan, Shinmen Takezo is shunned by his village for his wild nature. After a brutal battle, he seeks to become the greatest swordsman in the land, embarking on a journey of self-discovery and martial perfection.",
    mediaType: "manga",
    status: "hiatus",
    yearStart: 1998,
    yearEnd: null,
    metadataSource: "mangadex",
    metadataId: "b8e2d1a3-7f45-4c9e-a1b2-3d6e8f0c4a5b",
    monitored: 0,
    monitorType: "none",
    volumes: [
      { number: 1, title: "The Legend of the Musashi", releasedAt: now - day * 8000, chapters: [{ number: 1, title: "The Legend of the Musashi", pages: 32 }, { number: 2, title: "The Demon", pages: 28 }, { number: 3, title: "The Way of the Sword", pages: 30 }] },
      { number: 2, title: "The Way of the Sword", releasedAt: now - day * 7700, chapters: [{ number: 4, title: "The Way of the Sword", pages: 28 }, { number: 5, title: "The Duel", pages: 32 }, { number: 6, title: "The Aftermath", pages: 26 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 89128960, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-8",
    title: "The Walking Dead",
    slug: "the-walking-dead",
    description:
      "Rick Grimes wakes from a coma to a world overrun by zombies. He must lead a group of survivors through a post-apocalyptic landscape, facing not only the undead but the living who have become far more dangerous.",
    mediaType: "comic",
    status: "completed",
    yearStart: 2003,
    yearEnd: 2019,
    metadataSource: "comicvine",
    metadataId: "4050-18166",
    monitored: 0,
    monitorType: "none",
    volumes: [
      { number: 1, title: "Days Gone Bye", releasedAt: now - day * 7000, chapters: [{ number: 1, title: "Days Gone Bye", pages: 22 }, { number: 2, title: "The Road", pages: 20 }, { number: 3, title: "The Farm", pages: 24 }] },
      { number: 2, title: "Miles Behind Us", releasedAt: now - day * 6700, chapters: [{ number: 4, title: "Miles Behind Us", pages: 22 }, { number: 5, title: "The Prison", pages: 20 }, { number: 6, title: "The Governor", pages: 24 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "getcomics", progress: 100, fileSize: 115343360, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-9",
    title: "Sword Art Online",
    slug: "sword-art-online",
    description:
      "In the near future, a Virtual Reality Massively Multiplayer Online Role-Playing Game called Sword Art Online is released. Players soon discover they cannot log out, and death in the game means death in the real world.",
    mediaType: "light_novel",
    status: "ongoing",
    yearStart: 2009,
    yearEnd: null,
    metadataSource: "anilist",
    metadataId: "21400",
    monitored: 1,
    monitorType: "all",
    volumes: [
      { number: 1, title: "Aincrad", releasedAt: now - day * 5000, chapters: [{ number: 1, title: "Aincrad", pages: 40 }, { number: 2, title: "The Floor Boss", pages: 35 }, { number: 3, title: "The Duel", pages: 38 }] },
      { number: 2, title: "Aincrad Part 2", releasedAt: now - day * 4700, chapters: [{ number: 4, title: "Aincrad Part 2", pages: 38 }, { number: 5, title: "The Murder Case", pages: 35 }, { number: 6, title: "The Truth", pages: 40 }] },
    ],
    downloads: [
      { status: "completed", downloaderType: "slskd", progress: 100, fileSize: 31457280, retryCount: 0, errorMessage: null },
      { status: "queued", downloaderType: "slskd", progress: 0, fileSize: 0, retryCount: 0, errorMessage: null },
    ],
  },
  {
    id: "sr-10",
    title: "Batman: The Long Halloween",
    slug: "batman-the-long-halloween",
    description:
      "The Dark Knight of Gotham City wages an endless war on crime. When a mysterious killer strikes on every holiday, Batman must use his intellect and detective skills to uncover the identity of Holiday before the next holiday arrives.",
    mediaType: "comic",
    status: "completed",
    yearStart: 1996,
    yearEnd: 1997,
    metadataSource: "comicvine",
    metadataId: "4050-18071",
    monitored: 0,
    monitorType: "none",
    volumes: [
      { number: 1, title: "The Long Halloween Part 1", releasedAt: now - day * 9000, chapters: [{ number: 1, title: "The Long Halloween Part 1", pages: 24 }, { number: 2, title: "The Long Halloween Part 2", pages: 22 }, { number: 3, title: "The Long Halloween Part 3", pages: 24 }] },
      { number: 2, title: "The Long Halloween Part 2", releasedAt: now - day * 8700, chapters: [{ number: 4, title: "The Long Halloween Part 4", pages: 24 }, { number: 5, title: "The Long Halloween Part 5", pages: 22 }, { number: 6, title: "The Long Halloween Part 6", pages: 24 }] },
    ],
    downloads: [],
  },
];

// ─── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("  Clearing existing data...");
  db.delete(schema.downloadSource).run();
  db.delete(schema.download).run();
  db.delete(schema.chapter).run();
  db.delete(schema.volume).run();
  db.delete(schema.blocklist).run();
  db.delete(schema.metadataCache).run();
  db.delete(schema.settings).run();
  db.delete(schema.downloaderConfig).run();
  db.delete(schema.series).run();

  // Seed series
  for (const s of seriesData) {
    console.log(`  Creating series: ${s.title}`);

    db.insert(schema.series).values({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      mediaType: s.mediaType,
      status: s.status,
      yearStart: s.yearStart,
      yearEnd: s.yearEnd,
      metadataSource: s.metadataSource,
      metadataId: s.metadataId,
      monitored: s.monitored,
      monitorType: s.monitorType,
      createdAt: now - Math.random() * day * 30,
      updatedAt: now - Math.random() * day * 7,
    }).run();

    // Seed volumes and chapters
    for (const v of s.volumes) {
      const volId = `${s.id}-vol-${v.number}`;

      db.insert(schema.volume).values({
        id: volId,
        seriesId: s.id,
        volumeNumber: v.number,
        title: v.title,
        releasedAt: v.releasedAt,
        createdAt: v.releasedAt,
        updatedAt: v.releasedAt,
      }).run();

      for (const ch of v.chapters) {
        const chId = `${volId}-ch-${ch.number}`;

        db.insert(schema.chapter).values({
          id: chId,
          seriesId: s.id,
          volumeId: volId,
          chapterNumber: ch.number,
          title: ch.title,
          pages: ch.pages,
          releasedAt: v.releasedAt + ch.number * day * 7,
          createdAt: v.releasedAt + ch.number * day * 7,
          updatedAt: v.releasedAt + ch.number * day * 7,
        }).run();
      }
    }

    // Seed downloads
    for (let i = 0; i < s.downloads.length; i++) {
      const d = s.downloads[i];
      const vol = s.volumes[i % s.volumes.length];
      const volId = `${s.id}-vol-${vol.number}`;
      const downloadId = `${s.id}-dl-${i + 1}`;

      db.insert(schema.download).values({
        id: downloadId,
        seriesId: s.id,
        volumeId: volId,
        status: d.status,
        downloaderType: d.downloaderType,
        fileSize: d.fileSize,
        progress: d.progress,
        retryCount: d.retryCount,
        maxRetries: 3,
        errorMessage: d.errorMessage,
        priority: 0,
        autoSearch: 1,
        createdAt: now - day * (s.downloads.length - i) * 3,
        updatedAt: now - day * (s.downloads.length - i) * 1,
        completedAt: d.status === "completed" ? now - day * (s.downloads.length - i) * 1 : null,
      }).run();

      // Seed download sources for completed/downloading items
      if (d.status !== "queued") {
        db.insert(schema.downloadSource).values({
          id: `${downloadId}-src-1`,
          downloadId,
          downloaderType: d.downloaderType,
          title: `${s.title} Vol. ${vol.number}`,
          url: `https://example.com/download/${s.slug}/vol-${vol.number}`,
          fileSize: d.fileSize,
          seeders: Math.floor(Math.random() * 50) + 10,
          leechers: Math.floor(Math.random() * 10) + 1,
          score: Math.random() * 5,
          selected: 1,
          createdAt: now - day * s.downloads.length,
        }).run();
      }
    }
  }

  // Seed blocklist entries
  console.log("  Creating blocklist entries...");
  db.insert(schema.blocklist).values({
    id: "bl-1",
    seriesId: "sr-6",
    title: "Tower of God - Fake Release Vol. 5",
    downloaderType: "slskd",
    reason: "Malicious file detected",
    createdAt: now - day * 10,
  }).run();

  db.insert(schema.blocklist).values({
    id: "bl-2",
    seriesId: "sr-2",
    title: "Berserk - Low Quality Scan Vol. 4",
    downloaderType: "slskd",
    reason: "Quality below minimum threshold",
    createdAt: now - day * 5,
  }).run();

  // Seed settings
  console.log("  Creating settings...");
  db.insert(schema.settings).values({ key: "download_directory", value: "/media/comics" }).run();
  db.insert(schema.settings).values({ key: "auto_queue_monitored", value: "true" }).run();
  db.insert(schema.settings).values({ key: "max_concurrent_downloads", value: "3" }).run();
  db.insert(schema.settings).values({ key: "retry_limit", value: "3" }).run();
  db.insert(schema.settings).values({ key: "media_root", value: "./media" }).run();

  // Seed downloader configs
  console.log("  Creating downloader configs...");
  db.insert(schema.downloaderConfig).values({
    id: "dc-slskd",
    downloaderType: "slskd",
    enabled: 1,
    priority: 1,
    config: JSON.stringify({ url: "http://slskd:5030", apiKey: "" }),
    createdAt: now - day * 30,
    updatedAt: now - day * 7,
  }).run();

  db.insert(schema.downloaderConfig).values({
    id: "dc-getcomics",
    downloaderType: "getcomics",
    enabled: 1,
    priority: 2,
    config: JSON.stringify({ enabled: true }),
    createdAt: now - day * 30,
    updatedAt: now - day * 7,
  }).run();

  db.insert(schema.downloaderConfig).values({
    id: "dc-prowlarr",
    downloaderType: "prowlarr",
    enabled: 0,
    priority: 3,
    config: JSON.stringify({ url: "", apiKey: "" }),
    createdAt: now - day * 30,
    updatedAt: now - day * 7,
  }).run();

  // Seed metadata cache
  console.log("  Creating metadata cache...");
  db.insert(schema.metadataCache).values({
    id: "mc-1",
    source: "mangadex",
    sourceId: "a1c7c817-4e59-43b7-9365-09675a149a6f",
    dataType: "series",
    data: JSON.stringify({ title: "One Piece", description: "..." }),
    fetchedAt: now - day * 3,
    expiresAt: now + day * 4,
  }).run();

  console.log("\n✅ Seed complete!");
  console.log(`  ${seriesData.length} series`);
  console.log(`  ${seriesData.reduce((acc, s) => acc + s.volumes.length, 0)} volumes`);
  console.log(`  ${seriesData.reduce((acc, s) => acc + s.volumes.reduce((a, v) => a + v.chapters.length, 0), 0)} chapters`);
  console.log(`  ${seriesData.reduce((acc, s) => acc + s.downloads.length, 0)} downloads`);
  console.log(`  2 blocklist entries`);
  console.log(`  5 settings`);
  console.log(`  3 downloader configs`);
  console.log(`  1 metadata cache entry`);
}

seed()
  .catch(console.error)
  .finally(() => {
    sqlite.close();
    process.exit(0);
  });
