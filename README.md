# Comanga

**Manga, comics, and light novel downloader and manager.** Self-hosted, dark *arr-style UI, multi-source search and download.

![GitHub Release](https://img.shields.io/github/v/release/randrini/comanga?style=flat&label=release)
![CI](https://github.com/randrini/comanga/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/randrini/comanga?style=flat)

---

## Features

- **Multi-source search** — Search across SLSKD (Soulseek), Prowlarr, GetComics, and ComicsCode
- **Metadata enrichment** — Pulls series info from ComicVine, MangaDex, AniList, and MangaBaka
- **Download lifecycle** — State machine with retry, backoff, and dead letter queue
- **Dark *arr-style UI** — Dense, responsive, grid/list views with filters and tabs
- **Self-hosted** — Single Docker container with SQLite + Redis, companion services optional
- **Multi-arch** — `linux/amd64` and `linux/arm64` images on GHCR

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A [NEXTAUTH_SECRET](#configuration) (generate one below)

### 1. Clone and configure

```bash
git clone https://github.com/randrini/comanga.git
cd comanga
cp .env.example .env
```

### 2. Generate a secret

```bash
openssl rand -base64 32
```

Edit `.env` and set `NEXTAUTH_SECRET` to the output above.

### 3. Start Comanga

```bash
docker compose up -d
```

Open **http://localhost:3000** and sign in with the credentials from your `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

### 4. (Optional) Add companion services

Companion services run under Docker Compose profiles. Start them all:

```bash
docker compose --profile full up -d
```

Or pick specific ones:

```bash
docker compose --profile slskd --profile prowlarr up -d
```

Available profiles: `slskd`, `prowlarr`, `qbittorrent`, `sabnzbd`, `full` (all).

---

## Configuration

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXTAUTH_SECRET` | **Yes** | — | Auth session secret. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | Public URL of the Comanga instance |
| `ADMIN_USERNAME` | No | — | Admin login username (not set = no login possible) |
| `ADMIN_PASSWORD` | No | — | Admin login password |
| `DATABASE_URL` | No | `./data/comanga.db` | SQLite database path |
| `REDIS_HOST` | No | `redis` | Redis host for BullMQ job queue |
| `REDIS_PORT` | No | `6379` | Redis port |
| `MEDIA_ROOT` | No | `./media` | Where downloaded files are stored |

### Download source config

| Variable | Required | Description |
|----------|----------|-------------|
| `SLSKD_URL` | No | SLSKD instance URL (e.g. `http://slskd:5030`) |
| `SLSKD_API_KEY` | No | SLSKD API key |
| `PROWLARR_URL` | No | Prowlarr instance URL |
| `PROWLARR_API_KEY` | No | Prowlarr API key |
| `QBITTORRENT_URL` | No | qBittorrent Web UI URL |
| `QBITTORRENT_USERNAME` | No | qBittorrent username |
| `QBITTORRENT_PASSWORD` | No | qBittorrent password |
| `SABNZBD_URL` | No | SABnzbd instance URL |
| `SABNZBD_API_KEY` | No | SABnzbd API key |
| `GETCOMICS_ENABLED` | No | Enable GetComics scraper (`true`/`false`) |
| `COMICSCODE_ENABLED` | No | Enable ComicsCode scraper (`true`/`false`) |

### Metadata source config

| Variable | Required | Description |
|----------|----------|-------------|
| `COMICVINE_API_KEY` | No | ComicVine API key |
| `MANGADEX_ENABLED` | No | Enable MangaDex metadata (`true`/`false`) |
| `ANILIST_ENABLED` | No | Enable AniList metadata (`true`/`false`) |
| `MANGABAKA_ENABLED` | No | Enable MangaBaka metadata (`true`/`false`) |

---

## Development

### Prerequisites

- Node.js 22+
- Redis (for BullMQ)

### Setup

```bash
npm install
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET, REDIS_HOST=localhost, etc.
npm run db:push   # Create SQLite tables
npm run dev       # Start dev server at http://localhost:3000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run test` | Run tests |
| `npm run db:push` | Push Drizzle schema to SQLite |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio (GUI DB browser) |

### Build Docker image locally

```bash
docker compose -f compose.yaml -f compose.build.yaml up -d
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Comanga (Next.js)                 │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  tRPC    │  │ NextAuth │  │   BullMQ Workers   │  │
│  │  Router  │  │  (Auth)  │  │  ┌──────────────┐ │  │
│  └────┬─────┘  └────┬─────┘  │  │  Download     │ │  │
│       │              │        │  │  Metadata     │ │  │
│  ┌────▼──────────────▼─────┐  │  │  Maintenance  │ │  │
│  │     Drizzle ORM         │  │  └──────────────┘ │  │
│  │     (SQLite)            │  └────────┬──────────┘  │
│  └─────────────────────────┘           │             │
└────────────────────────────────────────┼─────────────┘
                                         │
                    ┌────────────────────▼─────┐
                    │         Redis             │
                    │   (BullMQ job queue)      │
                    └──────────────────────────┘

Companion services (optional):
  SLSKD ── Prowlarr ── qBittorrent ── SABnzbd
```

### Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| **API** | tRPC v11 (end-to-end type safety) |
| **Database** | SQLite via Drizzle ORM |
| **Queue** | BullMQ + Redis |
| **Auth** | NextAuth v4 (credentials) |
| **Deployment** | Docker, multi-arch GHCR |

### Download lifecycle

```
pending → queued → searching → downloading → verifying → importing → completed
                                                                    → failed (retry with backoff)
                                                                    → blocked (manual)
```

---

## CI/CD

Every push to `main` triggers:

1. **Lint & Typecheck** — ESLint + TypeScript check (gate)
2. **Build (amd64)** — Native build on `ubuntu-latest`
3. **Build (arm64)** — Native build on `ubuntu-24.04-arm` (no QEMU)
4. **Manifest merge** — Multi-arch manifest pushed to `ghcr.io/randrini/comanga:latest`

---

## License

GPL-3.0
