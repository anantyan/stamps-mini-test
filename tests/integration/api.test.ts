import { describe, expect, it } from "vitest";
import { createApp } from "../../src/server/app.js";

describe("API Integration Tests (Hono Endpoints)", () => {
  const app = createApp();

  it("GET /api/health - should return 200 OK with cache stats", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("stamps-mini-test-api");
    expect(body.cache).toBeDefined();
    expect(typeof body.cache.hits).toBe("number");
  });

  it("GET /api/task-1 - should return 200 OK with FooBar sequence result", async () => {
    const res = await app.request("/api/task-1");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.rawHorizontalText).toBeDefined();
    expect(body.items).toHaveLength(100);
    expect(body.printedCount).toBe(75);
    expect(body.omittedPrimesCount).toBe(25);
    expect(body.rawHorizontalText.startsWith("Bar, Foo, 98")).toBe(true);
  });

  it("GET /api/task-2 - should return 400 Bad Request when API key is missing", async () => {
    // Temporarily clear environment variable for this test
    const originalKey = process.env.OPENWEATHER_API_KEY;
    process.env.OPENWEATHER_API_KEY = "";

    try {
      const res = await app.request("/api/task-2");
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toContain("OPENWEATHER_API_KEY belum dikonfigurasi");
    } finally {
      if (originalKey) process.env.OPENWEATHER_API_KEY = originalKey;
    }
  });

  it("GET /api/task-2 - should return 200 OK when valid API key is present in environment", async () => {
    // Skip external network call if no key is present in test environment
    if (!process.env.OPENWEATHER_API_KEY) {
      return;
    }

    const res = await app.request("/api/task-2");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.city).toBe("Jakarta");
    expect(body.rawOutputText).toContain("Weather Forecast:");
    expect(body.dailyForecasts.length).toBeGreaterThanOrEqual(5);
  });

  it("Security Headers - should include security hardening headers", async () => {
    const res = await app.request("/api/health");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });
});
