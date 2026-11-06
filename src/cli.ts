import "dotenv/config";
import { fooBarService } from "./core/foobar/foobar.service.js";
import { weatherService } from "./core/weather/weather.service.js";

async function main() {
  console.log("================================================================================");
  console.log("       STAMPS TECHNICAL ASSESSMENT — SECTION A (MINI TEST)");
  console.log("       Candidate: Arya Rezza Anantya");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // TASK 1: Small Program (Reverse 100 to 1, Non-Prime, FooBar)
  // ---------------------------------------------------------------------------
  console.log(">>> MINI TEST 1: SMALL PROGRAM (100 TO 1, NON-PRIME, FOOBAR)");
  const task1Result = fooBarService.generateReverseFooBar();
  console.log(task1Result.rawHorizontalText);
  console.log(
    `\n[Summary: ${task1Result.printedCount} numbers printed, ${task1Result.omittedPrimesCount} prime numbers omitted]\n`,
  );

  // ---------------------------------------------------------------------------
  // TASK 2: Jakarta 5-Day Weather Forecast
  // ---------------------------------------------------------------------------
  console.log(">>> MINI TEST 2: JAKARTA 5-DAY WEATHER FORECAST");
  const apiKey = process.env.OPENWEATHER_API_KEY || "";

  if (!apiKey || apiKey === "your_openweathermap_api_key_here") {
    console.error("ERROR: OPENWEATHER_API_KEY belum dikonfigurasi di file .env");
    console.error("Silakan salin .env.example menjadi .env dan isi dengan API Key Anda.");
    process.exit(1);
  }

  try {
    const task2Result = await weatherService.getJakartaForecast(apiKey);
    console.log(task2Result.rawOutputText);
    console.log(
      `\n[City: ${task2Result.city} | Cache: ${task2Result.cached ? "HIT" : "MISS (Fresh Fetch)"} | Days: ${task2Result.dailyForecasts.length}]`,
    );
  } catch (error) {
    console.error("Gagal mengambil prakiraan cuaca:", (error as Error).message);
    process.exit(1);
  }

  console.log("\n================================================================================");
}

main();
