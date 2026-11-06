import { test, expect } from "@playwright/test";

test.describe("Stamps Mini Test UI (E2E Playwright Suite)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
