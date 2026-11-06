export interface DailyForecastItem {
  dateKey: string; // YYYY-MM-DD (WIB)
  formattedDate: string; // "Fri, 23 Apr 2021"
  tempCelsius: number; // 16.72
  formattedLine: string; // "Fri, 23 Apr 2021: 16.72°C"
  weatherDescription: string;
  timeSampled: string;
  humidity?: number;
  windSpeed?: number;
}

export interface WeatherForecastResult {
  city: string;
  rawOutputText: string;
  dailyForecasts: DailyForecastItem[];
  cached: boolean;
  cachedAt?: string;
  source: string;
}

export interface RawForecastEntry {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon?: string;
  }>;
  wind?: {
    speed: number;
  };
}

export interface RawForecastResponse {
  cod: string;
  message: number | string;
  cnt: number;
  list: RawForecastEntry[];
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number; // Offset in seconds (Jakarta: 25200 = UTC+7)
  };
}

export interface IWeatherProvider {
  fetchForecast(city: string, apiKey: string): Promise<RawForecastResponse>;
}

export interface IWeatherService {
  getJakartaForecast(apiKey: string): Promise<WeatherForecastResult>;
}
