import type { ICacheManager } from "../cache/cache.interface.js";
import { memoryCacheService } from "../cache/memory-cache.service.js";
import { openWeatherProvider } from "./openweather.provider.js";
import type {
  DailyForecastItem,
  IWeatherProvider,
  IWeatherService,
  RawForecastEntry,
  RawForecastResponse,
  WeatherForecastResult,
} from "./weather.interface.js";

/**
 * WeatherService mengimplementasikan aturan Mini Test 2:
 * 1. Mengambil data cuaca Jakarta 5 hari ke depan.
 * 2. Menampilkan tepat 1 suhu per hari (deduplikasi 40 timestamp interval 3 jam).
 * 3. Memformat tanggal dan suhu presisi sesuai contoh soal:
 *    "Weather Forecast:"
 *    "Fri, 23 Apr 2021: 16.72°C"
 * 4. High-Concurrency: Dilengkapi In-Memory Caching (TTL 15 min) & Request Coalescing.
 */
export class WeatherService implements IWeatherService {
  constructor(
    private provider: IWeatherProvider = openWeatherProvider,
    private cache: ICacheManager = memoryCacheService,
    private cacheTtlMs = 15 * 60 * 1000, // 15 menit
  ) {}

  /**
   * Format Date object menjadi string sesuai spesifikasi: "Fri, 23 Apr 2021"
   */
  public formatDate(date: Date): string {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dayName = days[date.getUTCDay()];
    const dayNum = String(date.getUTCDate()).padStart(2, "0");
    const monthName = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  }

  /**
   * Mengelompokkan raw entries (40 titik data) menjadi tepat 1 entri per hari kalender.
   */
  public aggregateDailyForecasts(response: RawForecastResponse): DailyForecastItem[] {
    const timezoneOffsetSec = response.city?.timezone ?? 25200; // Jakarta UTC+7 = 25200s
    const grouped = new Map<string, { entry: RawForecastEntry; localDate: Date }>();

    for (const entry of response.list) {
      // Hitung waktu lokal berdasarkan timezone kota
      const localEpochMs = (entry.dt + timezoneOffsetSec) * 1000;
      const localDate = new Date(localEpochMs);

      // Key kalender lokal: YYYY-MM-DD
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(localDate.getUTCDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      const hour = localDate.getUTCHours();

      // Pilih entri yang paling mendekati tengah hari (12:00 WIB)
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { entry, localDate });
      } else {
        const existing = grouped.get(dateKey);
        if (existing) {
          const existingHour = existing.localDate.getUTCHours();
          // Kedekatan dengan jam 12:00
          const currentDiff = Math.abs(hour - 12);
          const existingDiff = Math.abs(existingHour - 12);
          if (currentDiff < existingDiff) {
            grouped.set(dateKey, { entry, localDate });
          }
        }
      }
    }

    // Ambil maksimal 6 hari kalender (mencakup hari ini + 5 hari ke depan)
    const dailyItems: DailyForecastItem[] = [];
    for (const [dateKey, { entry, localDate }] of grouped.entries()) {
      const formattedDate = this.formatDate(localDate);
      const tempCelsius = Number(entry.main.temp.toFixed(2));
      const formattedLine = `${formattedDate}: ${tempCelsius.toFixed(2)}°C`;

      dailyItems.push({
        dateKey,
        formattedDate,
        tempCelsius,
        formattedLine,
        weatherDescription: entry.weather[0]?.description ?? "clear",
        timeSampled: entry.dt_txt,
        humidity: entry.main.humidity,
        windSpeed: entry.wind?.speed,
      });

      if (dailyItems.length >= 6) break;
    }

    return dailyItems;
  }

  /**
   * Mengambil prakiraan cuaca Jakarta 5 hari ke depan dengan proteksi Caching & Coalescing.
   */
  public async getJakartaForecast(
    apiKey: string,
    city = "Jakarta,ID",
  ): Promise<WeatherForecastResult> {
    const cacheKey = `weather:forecast:${city}`;

    // Cek apakah data sudah ada di cache sebelumnya
    const isCachedInitially = this.cache.get<WeatherForecastResult>(cacheKey) !== null;

    const result = await this.cache.getOrSet(
      cacheKey,
      async () => {
        const rawData = await this.provider.fetchForecast(city, apiKey);
        const dailyForecasts = this.aggregateDailyForecasts(rawData);

        const rawOutputText = [
          "Weather Forecast:",
          ...dailyForecasts.map((d) => d.formattedLine),
        ].join("\n");

        return {
          city: rawData.city?.name ?? "Jakarta",
          rawOutputText,
          dailyForecasts,
          cached: false,
          cachedAt: new Date().toISOString(),
          source: "OpenWeatherMap API",
        };
      },
      this.cacheTtlMs,
    );

    // Tandai apakah pemanggilan ini dilayani langsung dari cache
    return {
      ...result,
      cached: isCachedInitially,
    };
  }
}

export const weatherService = new WeatherService();
