import { describe, expect, it } from "vitest";
import { WeatherService } from "../../src/core/weather/weather.service.js";
import type {
  IWeatherProvider,
  RawForecastResponse,
} from "../../src/core/weather/weather.interface.js";
import { MemoryCacheService } from "../../src/core/cache/memory-cache.service.js";

// Mock Provider untuk memvalidasi transformasi data tanpa memanggil internet
class MockWeatherProvider implements IWeatherProvider {
  constructor(private mockData: RawForecastResponse) {}

  public async fetchForecast(_city: string, _apiKey: string): Promise<RawForecastResponse> {
    return this.mockData;
  }
}

describe("WeatherService (Mini Test 2)", () => {
  const sampleApiResponse: RawForecastResponse = {
    cod: "200",
    message: 0,
    cnt: 6,
    city: {
      id: 1642911,
      name: "Jakarta",
      country: "ID",
      timezone: 25200, // UTC+7
    },
    list: [
      // Day 1: 2021-04-23
      {
        dt: 1619150400, // 2021-04-23 04:00:00 UTC (11:00 WIB)
        dt_txt: "2021-04-23 04:00:00",
        main: { temp: 16.72, humidity: 70 },
        weather: [{ description: "light rain" }],
      },
      {
        dt: 1619161200, // 2021-04-23 07:00:00 UTC (14:00 WIB)
        dt_txt: "2021-04-23 07:00:00",
        main: { temp: 18.5, humidity: 65 },
        weather: [{ description: "moderate rain" }],
      },
      // Day 2: 2021-04-24
      {
        dt: 1619236800, // 2021-04-24 04:00:00 UTC (11:00 WIB)
        dt_txt: "2021-04-24 04:00:00",
        main: { temp: 20.15, humidity: 60 },
        weather: [{ description: "few clouds" }],
      },
      // Day 3: 2021-04-25
      {
        dt: 1619323200, // 2021-04-25 04:00:00 UTC (11:00 WIB)
        dt_txt: "2021-04-25 04:00:00",
        main: { temp: 21.0, humidity: 55 },
        weather: [{ description: "clear sky" }],
      },
    ],
  };

  it("should format dates accurately into 'Fri, 23 Apr 2021' format", () => {
    const service = new WeatherService();
    // 2021-04-23 12:00:00 UTC
    const date = new Date(Date.UTC(2021, 3, 23, 12, 0, 0));
    expect(service.formatDate(date)).toBe("Fri, 23 Apr 2021");
  });

  it("should aggregate 1 reading per day and format lines with XX.XX°C", () => {
    const mockProvider = new MockWeatherProvider(sampleApiResponse);
    const service = new WeatherService(mockProvider, new MemoryCacheService());

    const dailyItems = service.aggregateDailyForecasts(sampleApiResponse);

    // Day 1 had 2 entries in sample, should be deduplicated to 1
    expect(dailyItems).toHaveLength(3);

    // Verify format: "Fri, 23 Apr 2021: 16.72°C"
    expect(dailyItems[0].formattedLine).toBe("Fri, 23 Apr 2021: 16.72°C");
    expect(dailyItems[0].tempCelsius).toBe(16.72);

    expect(dailyItems[1].formattedLine).toBe("Sat, 24 Apr 2021: 20.15°C");
    expect(dailyItems[2].formattedLine).toBe("Sun, 25 Apr 2021: 21.00°C");
  });

  it("should generate the full Weather Forecast rawOutputText block matching spec", async () => {
    const mockProvider = new MockWeatherProvider(sampleApiResponse);
    const service = new WeatherService(mockProvider, new MemoryCacheService());

    const result = await service.getJakartaForecast("dummy-key");

    expect(result.city).toBe("Jakarta");
    expect(result.rawOutputText).toContain("Weather Forecast:");
    expect(result.rawOutputText).toContain("Fri, 23 Apr 2021: 16.72°C");
    expect(result.rawOutputText).toContain("Sat, 24 Apr 2021: 20.15°C");
    expect(result.rawOutputText).toContain("Sun, 25 Apr 2021: 21.00°C");
  });
});
