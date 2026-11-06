import type { IWeatherProvider, RawForecastResponse } from "./weather.interface.js";

/**
 * OpenWeatherProvider menangani interaksi HTTP ke OpenWeatherMap 5 Day / 3 Hour Forecast API.
 * Mengimplementasikan IWeatherProvider sesuai prinsip DIP / OCP.
 */
export class OpenWeatherProvider implements IWeatherProvider {
  private baseUrl = "https://api.openweathermap.org/data/2.5/forecast";

  public async fetchForecast(city: string, apiKey: string): Promise<RawForecastResponse> {
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_openweathermap_api_key_here") {
      throw new Error("OPENWEATHER_API_KEY belum dikonfigurasi di environment server.");
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set("q", city);
    url.searchParams.set("units", "metric");
    url.searchParams.set("appid", apiKey.trim());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: { message?: string } | null = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Fallback to text
      }

      const msg = errorJson?.message || errorText || response.statusText;
      if (response.status === 401) {
        throw new Error(`OpenWeatherMap API Key tidak valid: ${msg}`);
      }
      if (response.status === 429) {
        throw new Error(`OpenWeatherMap rate limit terlampaui (429 Too Many Requests): ${msg}`);
      }
      throw new Error(`OpenWeatherMap Error (HTTP ${response.status}): ${msg}`);
    }

    return (await response.json()) as RawForecastResponse;
  }
}

export const openWeatherProvider = new OpenWeatherProvider();
