import type { CacheEntry, CacheStats, ICacheManager } from "./cache.interface.js";

/**
 * MemoryCacheService mengimplementasikan In-Memory Cache berkecepatan tinggi dengan:
 * 1. Time-To-Live (TTL) berbasis timestamp.
 * 2. Single-Flight Request Coalescing (mencegah Thundering Herd / Cache Stampede).
 *    Ketika ribuan request memanggil key yang sama saat cache dingin,
 *    hanya 1 fungsi fetcher yang dieksekusi, sisanya menunggu promise yang sama.
 * 3. Stale-While-Revalidate Fallback: Jika fetcher eksternal gagal / rate-limited,
 *    cache tetap bisa menyajikan data lama yang tersimpan untuk ketersediaan tinggi.
 */
export class MemoryCacheService implements ICacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    coalescedRequests: 0,
    itemCount: 0,
  };

  constructor(private defaultTtlMs = 15 * 60 * 1000) {}

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      // Data expired
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  public getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.value : null;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const now = Date.now();
    this.cache.set(key, {
      value,
      cachedAt: now,
      expiresAt: now + ttl,
    });
    this.stats.itemCount = this.cache.size;
  }

  /**
   * Menjalankan fetcher dengan request coalescing (Single-Flight Pattern).
   */
  public async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    // 1. Cek cache yang masih valid
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. Cek apakah ada request inflight untuk key ini
    const inflightPromise = this.inflight.get(key) as Promise<T> | undefined;
    if (inflightPromise) {
      this.stats.coalescedRequests++;
      return inflightPromise;
    }

    // 3. Eksekusi fetcher baru dan simpan promise di inflight map
    this.stats.misses++;
    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } catch (error) {
        // Fallback: Jika fetch gagal (misal API OpenWeather 429 atau timeout),
        // coba sajikan data stale jika pernah ada di cache sebelumnya
        const stale = this.getStale<T>(key);
        if (stale !== null) {
          console.warn(
            `[MemoryCacheService] Fallback to stale data for key "${key}" due to fetch error:`,
            (error as Error).message,
          );
          return stale;
        }
        throw error;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.stats.itemCount = this.cache.size;
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.inflight.clear();
    this.stats.itemCount = 0;
  }

  public getStats(): CacheStats {
    return { ...this.stats, itemCount: this.cache.size };
  }
}

// Export singleton instance dengan default TTL 15 menit
export const memoryCacheService = new MemoryCacheService(15 * 60 * 1000);
