import React, { useCallback, useEffect, useState } from "react";
import { fooBarService } from "../core/foobar/foobar.service.js";
import type {
  DailyForecastItem,
  WeatherForecastResult,
} from "../core/weather/weather.interface.js";

type ActiveTab = "task1" | "task2";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("task1");
  const [showSkippedPrimes, setShowSkippedPrimes] = useState<boolean>(false);
  const [copiedTask1, setCopiedTask1] = useState<boolean>(false);
  const [copiedTask2, setCopiedTask2] = useState<boolean>(false);

  // Task 1: Deterministik matematis
  const task1Data = fooBarService.generateReverseFooBar();

  // Task 2: State Cuaca
  const [weatherData, setWeatherData] = useState<WeatherForecastResult | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const fetchWeather = useCallback(
    async (apiKeyOverride?: string) => {
      setLoadingWeather(true);
      setWeatherError(null);
      try {
        const params = new URLSearchParams();
        const keyToUse = apiKeyOverride ?? customApiKey;
        if (keyToUse.trim()) {
          params.set("apiKey", keyToUse.trim());
        }

        const queryString = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`/api/task-2${queryString}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal mengambil data cuaca dari server proxy.");
        }

        setWeatherData(data as WeatherForecastResult);
      } catch (err) {
        setWeatherError((err as Error).message);
      } finally {
        setLoadingWeather(false);
      }
    },
    [customApiKey],
  );

  useEffect(() => {
    if (activeTab === "task2" && !weatherData && !weatherError) {
      fetchWeather();
    }
  }, [activeTab, weatherData, weatherError, fetchWeather]);

  const handleCopy = (text: string, isTask1: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTask1) {
      setCopiedTask1(true);
      setTimeout(() => setCopiedTask1(false), 1600);
    } else {
      setCopiedTask2(true);
      setTimeout(() => setCopiedTask2(false), 1600);
    }
  };

  const visibleTask1Items = showSkippedPrimes
    ? task1Data.items
    : task1Data.items.filter((item) => !item.isPrime);

  return (
    <div className="container">
      {/* Header Halaman */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Stamps Technical Assessment — Section A (Mini Test)</h1>
          <p className="page-subtitle">
            Enterprise Fullstack TypeScript · High-Concurrency Proxy · OpenUI Standard
          </p>
        </div>
        <div className="page-meta">
          <span>
            Candidate: <strong>Arya Rezza Anantya</strong>
          </span>
        </div>
      </header>

      {/* Semantic OpenUI Tablist */}
      <div role="tablist" aria-label="Stamps Assessment Tasks" className="openui-tablist">
        <button
          type="button"
          role="tab"
          id="tab-task1"
          aria-selected={activeTab === "task1"}
          aria-controls="panel-task1"
          className="openui-tab"
          onClick={() => setActiveTab("task1")}
        >
          1. Small Program (Reverse 100–1 FooBar)
        </button>
        <button
          type="button"
          role="tab"
          id="tab-task2"
          aria-selected={activeTab === "task2"}
          aria-controls="panel-task2"
          className="openui-tab"
          onClick={() => setActiveTab("task2")}
        >
          2. Jakarta 5-Day Weather Forecast
        </button>
      </div>

      {/* TAB PANEL 1: SMALL PROGRAM (100 -> 1) */}
      {activeTab === "task1" && (
        <section role="tabpanel" id="panel-task1" aria-labelledby="tab-task1">
          {/* Panel Output Horizontal Murni */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                Horizontal Output (Formatted per Exact Specification)
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(task1Data.rawHorizontalText, true)}
              >
                {copiedTask1 ? "Copied to Clipboard!" : "Copy Output"}
              </button>
            </div>
            <div className="panel-body">
              <pre className="raw-output-box" data-testid="task1-raw-output">
                {task1Data.rawHorizontalText}
              </pre>
            </div>
          </div>

          {/* Panel Matriks Evaluasi Angka */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                Sequence Evaluation Matrix ({visibleTask1Items.length} items shown)
              </span>
              <label className="filter-bar">
                <input
                  type="checkbox"
                  checked={showSkippedPrimes}
                  onChange={(e) => setShowSkippedPrimes(e.target.checked)}
                  data-testid="toggle-primes"
                />
                Show filtered prime numbers (25 omitted primes)
              </label>
            </div>
            <div className="panel-body">
              <div className="number-grid">
                {visibleTask1Items.map((item) => (
                  <div
                    key={item.value}
                    className={`number-cell ${item.isPrime ? "is-prime" : ""}`}
                    title={
                      item.isPrime
                        ? `${item.value} is a prime number (omitted)`
                        : `Evaluated output for ${item.value}`
                    }
                  >
                    <span style={{ color: "var(--text-muted)" }}>{item.value}:</span>
                    {item.isPrime ? (
                      <span style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>PRIME</span>
                    ) : item.output === "FooBar" ? (
                      <strong className="foobar">FooBar</strong>
                    ) : item.output === "Foo" ? (
                      <strong className="foo">Foo</strong>
                    ) : item.output === "Bar" ? (
                      <strong className="bar">Bar</strong>
                    ) : (
                      <span>{item.output}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB PANEL 2: JAKARTA WEATHER FORECAST */}
      {activeTab === "task2" && (
        <section role="tabpanel" id="panel-task2" aria-labelledby="tab-task2">
          {/* Panel Output Format Teks Standard Soal */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                Weather Forecast Output (Jakarta 5-Day Forecast)
                {weatherData && (
                  <span
                    className={`badge ${weatherData.cached ? "badge-success" : "badge-info"}`}
                    title="In-Memory Cache (TTL 15 Min) & SingleFlight Coalescing Protection"
                  >
                    {weatherData.cached ? "Cache HIT (<1ms)" : "Fresh Fetch"}
                  </span>
                )}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fetchWeather()}
                  disabled={loadingWeather}
                  data-testid="refresh-weather-btn"
                >
                  {loadingWeather ? "Refreshing..." : "Refresh Data"}
                </button>
                {weatherData && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleCopy(weatherData.rawOutputText, false)}
                  >
                    {copiedTask2 ? "Copied to Clipboard!" : "Copy Output"}
                  </button>
                )}
              </div>
            </div>
            <div className="panel-body">
              {loadingWeather && (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Connecting to OpenWeatherMap via high-concurrency server proxy...
                </p>
              )}

              {weatherError && (
                <div className="alert alert-error" data-testid="weather-error">
                  <strong>Error: </strong> {weatherError}
                </div>
              )}

              {!loadingWeather && !weatherError && weatherData && (
                <pre className="raw-output-box" data-testid="weather-raw-output">
                  {weatherData.rawOutputText}
                </pre>
              )}
            </div>
          </div>

          {/* Panel Tabel Inspeksi Detail 1 Suhu / Hari */}
          {!loadingWeather && !weatherError && weatherData && (
            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-title">
                  Daily Forecast Breakdown (Exactly 1 Reading per Calendar Day)
                </span>
                <span className="page-meta">
                  City: {weatherData.city} · Source: {weatherData.source}
                </span>
              </div>
              <div className="data-table-container">
                <table className="data-table" data-testid="weather-table">
                  <thead>
                    <tr>
                      <th>Formatted Date</th>
                      <th>Temperature</th>
                      <th>Condition</th>
                      <th>Sampled Timestamp (UTC)</th>
                      <th>Humidity</th>
                      <th>Wind Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatherData.dailyForecasts.map((item: DailyForecastItem) => (
                      <tr key={item.dateKey}>
                        <td className="mono-cell">
                          <strong>{item.formattedDate}</strong>
                        </td>
                        <td className="mono-cell">
                          <span style={{ color: "var(--accent-color)", fontWeight: 600 }}>
                            {item.tempCelsius.toFixed(2)}°C
                          </span>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{item.weatherDescription}</td>
                        <td className="mono-cell" style={{ color: "var(--text-muted)" }}>
                          {item.timeSampled}
                        </td>
                        <td className="mono-cell">{item.humidity ?? "-"}%</td>
                        <td className="mono-cell">{item.windSpeed ?? "-"} m/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tester API Key Customizer Section */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">Tester / Reviewer API Key Configuration</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowKeyInput(!showKeyInput)}
              >
                {showKeyInput ? "Hide Settings" : "Configure Custom Key"}
              </button>
            </div>
            {showKeyInput && (
              <div className="panel-body">
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Secara default, proxy server menggunakan <code>OPENWEATHER_API_KEY</code> yang
                  dikonfigurasi di file <code>.env</code> server. Jika reviewer ingin menguji dengan
                  kunci API OpenWeatherMap sendiri, masukkan di bawah ini:
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <input
                    type="password"
                    placeholder="Enter custom OpenWeatherMap API Key..."
                    className="input-text"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    data-testid="custom-key-input"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => fetchWeather(customApiKey)}
                  >
                    Apply & Fetch
                  </button>
                  {customApiKey && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setCustomApiKey("");
                        fetchWeather("");
                      }}
                    >
                      Reset to Server Default
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="page-footer">
        Stamps Technical Assessment — Section A (Mini Test) · Built with Clean Architecture & SOLID
        Principles
      </footer>
    </div>
  );
}
