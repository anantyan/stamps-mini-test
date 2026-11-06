export interface CacheEntry<T> {
  value: T;
  cachedAt: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  coalescedRequests: number;
  itemCount: number;
}

export interface ICacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs?: number): void;
  getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T>;
  delete(key: string): boolean;
  clear(): void;
  getStats(): CacheStats;
}
