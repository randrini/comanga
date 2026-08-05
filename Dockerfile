FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 comanga && \
  adduser --system --uid 1001 comanga && \
  apk add --no-cache su-exec

# Copy standalone Next.js output
COPY --from=builder /app/.next/standalone ./

# Copy static assets (needed by standalone output)
COPY --from=builder /app/.next/static ./.next/static

# Copy database init script and entrypoint
COPY scripts/init-db.mjs ./scripts/init-db.mjs
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]