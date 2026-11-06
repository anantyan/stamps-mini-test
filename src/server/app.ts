import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { memoryCacheService } from "../core/cache/memory-cache.service.js";
import { fooBarService } from "../core/foobar/foobar.service.js";
import { weatherService } from "../core/weather/weather.service.js";

export function createApp() {
  const app = new Hono();

  // Middleware: Logging & CORS
  app.use("*", logger());
  app.use(
    "/api/*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Security Headers
  app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "1; mode=block");
  });

  // Health & Monitoring Endpoint
  app.get("/api/health", (c) => {
    return c.json({
      status: "healthy",
      service: "stamps-mini-test-api",
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      cache: memoryCacheService.getStats(),
    });
  });

  // Mini Test 1: Reverse Non-Prime FooBar (100 -> 1)
  app.get("/api/task-1", (c) => {
    try {
      const result = fooBarService.generateReverseFooBar();
      return c.json(result);
    } catch (error) {
      return c.json(
        {
          error: (error as Error).message,
        },
        500,
      );
    }
  });

  // Mini Test 2: Jakarta 5-Day Weather Forecast
  app.get("/api/task-2", async (c) => {
    const apiKey = c.req.query("apiKey") || process.env.OPENWEATHER_API_KEY || "";

    if (!apiKey || apiKey === "your_openweathermap_api_key_here") {
      return c.json(
        {
          error:
            "OPENWEATHER_API_KEY belum dikonfigurasi di sisi server (.env). Silakan atur variabel environment atau masukkan API Key.",
        },
        400,
      );
    }

    try {
      const city = c.req.query("city") || "Jakarta,ID";
      const result = await weatherService.getJakartaForecast(apiKey, city);
      return c.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      const status =
        msg.includes("401") || msg.includes("tidak valid") ? 401 : msg.includes("429") ? 429 : 500;

      return c.json(
        {
          error: msg,
        },
        status,
      );
    }
  });

  return app;
}
