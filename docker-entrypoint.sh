#!/bin/sh
# Comanga — Docker entrypoint
# Initializes the database (creates tables + seeds demo data) on first run,
# then starts the Next.js production server.

set -e

echo "[entrypoint] Starting Comanga..."

# Run database initialization (creates tables + seeds if empty)
node /app/scripts/init-db.mjs

echo "[entrypoint] Starting server..."
exec node /app/server.js
