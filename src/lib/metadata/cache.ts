import { db as _db } from '@/lib/db';
import { metadataCache as _metadataCacheTable } from '@/lib/db/schema';
import { eq as _eq, and as _and } from 'drizzle-orm';
import type { MetadataSource } from './types';

export class MetadataCache {
  /**
   * Retrieve a cached metadata entry by source, sourceId, and dataType.
   * Returns `null` when the entry is missing or expired.
   */
  async get(
    source: MetadataSource,
    sourceId: string,
    dataType: string,
  ): Promise<string | null> {
    // TODO: implement with drizzle
    // const rows = await db
    //   .select({ data: metadataCache.data })
    //   .from(metadataCache)
    //   .where(
    //     and(
    //       eq(metadataCache.source, source),
    //       eq(metadataCache.sourceId, sourceId),
    //       eq(metadataCache.dataType, dataType),
    //     ),
    //   )
    //   .limit(1);
    // if (!rows.length) return null;
    // const row = rows[0];
    // // Check expiry
    // if (row.expiresAt < Date.now()) {
    //   await this.invalidate(source, sourceId, dataType);
    //   return null;
    // }
    // return row.data;
    void source;
    void sourceId;
    void dataType;
    return null;
  }

  /**
   * Store a metadata entry in the cache with a TTL in seconds.
   */
  async set(
    source: MetadataSource,
    sourceId: string,
    dataType: string,
    data: string,
    ttlSeconds: number,
  ): Promise<void> {
    // TODO: implement with drizzle
    // const expiresAt = Date.now() + ttlSeconds * 1000;
    // await db
    //   .insert(metadataCache)
    //   .values({
    //     id: `${source}:${sourceId}:${dataType}`,
    //     source,
    //     sourceId,
    //     dataType,
    //     data,
    //     fetchedAt: Date.now(),
    //     expiresAt,
    //   })
    //   .onConflictDoUpdate({
    //     target: metadataCache.sourceSourceIdDataTypeUnique,
    //     set: { data, fetchedAt: Date.now(), expiresAt },
    //   });
    void source;
    void sourceId;
    void dataType;
    void data;
    void ttlSeconds;
  }

  /**
   * Invalidate a specific cache entry, or all entries for a (source, sourceId)
   * pair when dataType is omitted.
   */
  async invalidate(
    source: MetadataSource,
    sourceId: string,
    dataType?: string,
  ): Promise<void> {
    // TODO: implement with drizzle
    // const conditions = [
    //   eq(metadataCache.source, source),
    //   eq(metadataCache.sourceId, sourceId),
    // ];
    // if (dataType) {
    //   conditions.push(eq(metadataCache.dataType, dataType));
    // }
    // await db.delete(metadataCache).where(and(...conditions));
    void source;
    void sourceId;
    void dataType;
  }

  /**
   * Invalidate all cached entries for a given sourceId across every source.
   */
  async invalidateSeries(sourceId: string): Promise<void> {
    // TODO: implement with drizzle
    // await db
    //   .delete(metadataCache)
    //   .where(eq(metadataCache.sourceId, sourceId));
    void sourceId;
  }

  /**
   * Remove all expired cache entries.
   */
  async cleanup(): Promise<void> {
    // TODO: implement with drizzle
    // await db
    //   .delete(metadataCache)
    //   .where(lt(metadataCache.expiresAt, Date.now()));
  }
}

export const metadataCacheInstance = new MetadataCache();
