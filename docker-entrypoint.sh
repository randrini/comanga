#!/bin/sh
# Comanga — Docker entrypoint
# Runs as root to ensure the data directory exists with correct permissions,
# then drops to the comanga user to start the server.

set -e

echo "[entrypoint] Starting Comanga..."

# Ensure data directory exists and is writable by comanga user
DATA_DIR="${DATABASE_URL:-/app/data/comanga.db}"
DATA_DIR="$(dirname "$DATA_DIR")"
mkdir -p "$DATA_DIR"
chown -R 1001:1001 "$DATA_DIR"

# Run database initialization (creates tables + seeds if empty)
node /app/scripts/init-db.mjs

echo "[entrypoint] Starting server..."

# Drop privileges to comanga user and start the server
exec su-exec comanga node /app/server.js
