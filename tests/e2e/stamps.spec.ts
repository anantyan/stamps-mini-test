import { test, expect } from "@playwright/test";

const mockWeatherData = {
  city: "Jakarta",
  rawOutputText:
    "Weather Forecast:\nThu, 06 Nov 2026: 31.25°C\nFri, 07 Nov 2026: 30.12°C\nSat, 08 Nov 2026: 29.50°C\nSun, 09 Nov 2026: 32.00°C\nMon, 10 Nov 2026: 31.80°C\nTue, 11 Nov 2026: 30.50°C",
  dailyForecasts: [
    {
      dateKey: "2026-11-06",
      formattedDate: "Thu, 06 Nov 2026",
      tempCelsius: 31.25,
      formattedLine: "Thu, 06 Nov 2026: 31.25°C",
      weatherDescription: "scattered clouds",
      timeSampled: "12:00:00 (WIB)",
      humidity: 70,
      windSpeed: 3.5,
    },
    {
      dateKey: "2026-11-07",
      formattedDate: "Fri, 07 Nov 2026",
      tempCelsius: 30.12,
      formattedLine: "Fri, 07 Nov 2026: 30.12°C",
      weatherDescription: "light rain",
      timeSampled: "12:00:00 (WIB)",
      humidity: 80,
      windSpeed: 4.1,
    },
    {
      dateKey: "2026-11-08",
      formattedDate: "Sat, 08 Nov 2026",
      tempCelsius: 29.5,
      formattedLine: "Sat, 08 Nov 2026: 29.50°C",
      weatherDescription: "moderate rain",
      timeSampled: "12:00:00 (WIB)",
      humidity: 85,
      windSpeed: 4.0,
    },
    {
      dateKey: "2026-11-09",
      formattedDate: "Sun, 09 Nov 2026",
      tempCelsius: 32.0,
      formattedLine: "Sun, 09 Nov 2026: 32.00°C",
      weatherDescription: "few clouds",
      timeSampled: "12:00:00 (WIB)",
      humidity: 65,
      windSpeed: 2.9,
    },
    {
      dateKey: "2026-11-10",
      formattedDate: "Mon, 10 Nov 2026",
      tempCelsius: 31.8,
      formattedLine: "Mon, 10 Nov 2026: 31.80°C",
      weatherDescription: "clear sky",
      timeSampled: "12:00:00 (WIB)",
      humidity: 60,
      windSpeed: 3.2,
    },
    {
      dateKey: "2026-11-11",
      formattedDate: "Tue, 11 Nov 2026",
      tempCelsius: 30.5,
      formattedLine: "Tue, 11 Nov 2026: 30.50°C",
      weatherDescription: "broken clouds",
      timeSampled: "12:00:00 (WIB)",
      humidity: 72,
      windSpeed: 3.8,
    },
  ],
  cached: false,
  cachedAt: "2026-11-06T11:00:00.000Z",
  source: "OpenWeatherMap 5-Day Forecast API",
};

test.describe("Stamps Mini Test UI (E2E Playwright Suite)", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      console.error("[Browser PageError]", err.message);
    });
    page.on("console", (msg) => {
      console.log(`[Browser Console ${msg.type()}]`, msg.text());
    });

    // Intercept /api/task-2 to ensure deterministic E2E test runs across CI and forks
    await page.route("**/api/task-2*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockWeatherData),
      });
    });

    await page.goto("/");
    await expect(page.locator(".page-title")).toBeVisible();
  });

  test("1. Should display page header, candidate meta, and default to Tab 1 (FooBar)", async ({
    page,
  }) => {
    // Check Title
    await expect(page.locator(".page-title")).toContainText("Stamps Technical Assessment");
    await expect(page.locator(".page-meta")).toContainText("Arya Rezza Anantya");

    // Check Tab 1 is active by default
    const tab1 = page.locator("#tab-task1");
    await expect(tab1).toHaveAttribute("aria-selected", "true");

    // Verify raw output box has FooBar content
    const rawOutput = page.locator('[data-testid="task1-raw-output"]');
    await expect(rawOutput).toBeVisible();
    await expect(rawOutput).toContainText("Bar, Foo, 98, Foo, Bar, 94");
    await expect(rawOutput).toContainText("8, Foo, 4, 1");
  });

  test("2. Should toggle filtered prime numbers in matrix inspection", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-primes"]');
    await expect(toggle).not.toBeChecked();

    // Default: primes are hidden, 75 items
    let matrixCells = page.locator(".number-cell");
    await expect(matrixCells).toHaveCount(75);

    // Toggle on: 100 items including omitted primes
    await toggle.check();
    await expect(toggle).toBeChecked();
    matrixCells = page.locator(".number-cell");
    await expect(matrixCells).toHaveCount(100);

    // Toggle off again: back to 75
    await toggle.uncheck();
    await expect(matrixCells).toHaveCount(75);
  });

  test("3. Should switch to Tab 2 and render Jakarta 5-Day Weather Forecast", async ({ page }) => {
    const tab2 = page.locator("#tab-task2");
    await tab2.click();
    await expect(tab2).toHaveAttribute("aria-selected", "true");

    // Weather raw output should appear
    const weatherRaw = page.locator('[data-testid="weather-raw-output"]');
    await expect(weatherRaw).toBeVisible({ timeout: 15_000 });
    await expect(weatherRaw).toContainText("Weather Forecast:");
    await expect(weatherRaw).toContainText("°C");

    // Daily breakdown table should be rendered
    const table = page.locator('[data-testid="weather-table"]');
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(await rows.count());
    expect(await rows.count()).toBeGreaterThanOrEqual(5);

    // Verify first row contains formatted date and temperature
    const firstRowText = await rows.first().innerText();
    expect(firstRowText).toContain("°C");
  });

  test("4. Should handle weather refresh action smoothly", async ({ page }) => {
    const tab2 = page.locator("#tab-task2");
    await tab2.click();

    const refreshBtn = page.locator('[data-testid="refresh-weather-btn"]');
    await expect(refreshBtn).toBeVisible({ timeout: 15_000 });
    await refreshBtn.click();

    // Should still display weather data without crashing
    const weatherRaw = page.locator('[data-testid="weather-raw-output"]');
    await expect(weatherRaw).toBeVisible();
    await expect(weatherRaw).toContainText("Weather Forecast:");
  });
});
