import { describe, expect, it } from "vitest";
import { MemoryCacheService } from "../../src/core/cache/memory-cache.service.js";

describe("MemoryCacheService (High Concurrency & Anti-Rate-Limit)", () => {
  it("should store and retrieve data within TTL", () => {
    const cache = new MemoryCacheService(1000);
    cache.set("key1", { data: "test" });

    expect(cache.get("key1")).toEqual({ data: "test" });
  });

  it("should return null after TTL expires", async () => {
    const cache = new MemoryCacheService(20); // 20ms TTL
    cache.set("shortKey", "val");

    expect(cache.get("shortKey")).toBe("val");
    await new Promise((resolve) => setTimeout(resolve, 35));
    expect(cache.get("shortKey")).toBeNull();
  });

  it("should coalesce concurrent requests to prevent Cache Stampede (Single-Flight Pattern)", async () => {
    const cache = new MemoryCacheService(10_000);
    let fetchCount = 0;

    const slowFetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { temp: 28.5 };
    };

    // Trigger 50 concurrent calls to getOrSet simultaneously
    const promises = Array.from({ length: 50 }, () => cache.getOrSet("coalesced-key", slowFetcher));

    const results = await Promise.all(promises);

    // Verify fetcher was executed ONLY once despite 50 concurrent requests
    expect(fetchCount).toBe(1);
    expect(results).toHaveLength(50);
    for (const res of results) {
      expect(res).toEqual({ temp: 28.5 });
    }

    const stats = cache.getStats();
    expect(stats.misses).toBe(1);
    expect(stats.coalescedRequests).toBe(49);
  });

  it("should serve stale data as fallback when fetcher throws error", async () => {
    const cache = new MemoryCacheService(10); // 10ms TTL
    cache.set("fallbackKey", "initial-data");

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cache.get("fallbackKey")).toBeNull(); // Expired

    // Now try getOrSet with a failing fetcher
    const failingFetcher = async () => {
      throw new Error("OpenWeatherMap 429 Too Many Requests");
    };

    const data = await cache.getOrSet("fallbackKey", failingFetcher);
    // Should fallback to stale data rather than throwing an error
    expect(data).toBe("initial-data");
  });
});
