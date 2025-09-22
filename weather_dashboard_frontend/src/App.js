import React, { useEffect, useMemo, useState } from "react";
import "./theme.css";
import "./App.css";
import { getWeatherByCity, codeToEmoji } from "./services/weatherApi";

// Helpers
function fmtTemp(t, units) {
  if (t === undefined || t === null) return "-";
  const rounded = Math.round(t);
  return `${rounded}°${units === "imperial" ? "F" : "C"}`;
}

function toDow(ts) {
  try {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString(undefined, { weekday: "short" });
  } catch {
    return "";
  }
}

function windDir(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16] || "";
}

/**
 * SearchHeader component: brand + search form
 */
function SearchHeader({ onSearch, initialCity = "San Francisco" }) {
  const [query, setQuery] = useState(initialCity);

  return (
    <header className="candy-header" role="banner">
      <div className="header-inner">
        <div className="brand" aria-label="Candy Pop Weather">
          <div className="brand-logo" aria-hidden>☀️</div>
          <div className="brand-title">Candy Pop Weather</div>
        </div>
        <form
          className="search"
          role="search"
          aria-label="Search city"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (trimmed) onSearch(trimmed);
          }}
        >
          <input
            placeholder="Search city (e.g., Tokyo, Paris, New York)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="City name"
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">Search</button>
        </form>
      </div>
    </header>
  );
}

/**
 * CurrentWeatherCard component
 */
function CurrentWeatherCard({ weather, location, units }) {
  if (!weather || !location) return null;
  const { current } = weather;
  const icon = current?.weather?.[0]?.icon;
  const main = current?.weather?.[0]?.main || "";
  const desc = current?.weather?.[0]?.description || "";
  const code = current?.weather?.[0]?.id;
  const emoji = codeToEmoji(code);

  return (
    <section className="card current-card" aria-label="Current weather">
      <div className="current-top">
        <div className="location">
          <span style={{ fontSize: 22 }}>📍</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              {location.name}
            </div>
            <div className="meta">
              {location.state ? `${location.state}, ` : ""}
              {location.country}
            </div>
          </div>
        </div>
        <div className="temp-row" aria-label="Temperature and condition">
          <div className="temp">{fmtTemp(current?.temp, units)}</div>
          <div className="weather-desc">
            {icon ? (
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                width={48}
                height={48}
                alt={desc || main}
                style={{ verticalAlign: "middle" }}
              />
            ) : (
              <span aria-hidden style={{ fontSize: 32 }}>{emoji}</span>
            )}
            <span style={{ marginLeft: 6, textTransform: "capitalize" }}>
              {desc || main}
            </span>
          </div>
        </div>
      </div>

      <div className="metrics" role="list" aria-label="Current metrics">
        <div className="metric" role="listitem">
          <div className="label">Feels like</div>
          <div className="value">{fmtTemp(current?.feels_like, units)}</div>
        </div>
        <div className="metric" role="listitem">
          <div className="label">Humidity</div>
          <div className="value">{current?.humidity ?? "-"}%</div>
        </div>
        <div className="metric" role="listitem">
          <div className="label">Wind</div>
          <div className="value">
            {current?.wind_speed != null ? `${Math.round(current.wind_speed)} ${units === "imperial" ? "mph" : "m/s"}` : "-"}
            {current?.wind_deg != null ? ` ${windDir(current.wind_deg)}` : ""}
          </div>
        </div>
        <div className="metric" role="listitem">
          <div className="label">Pressure</div>
          <div className="value">{current?.pressure ?? "-"} hPa</div>
        </div>
      </div>
    </section>
  );
}

/**
 * ForecastScroller component for 7 days
 */
function ForecastScroller({ daily, units }) {
  if (!Array.isArray(daily) || daily.length === 0) return null;
  // One Call returns up to 8 entries, we show 7.
  const items = daily.slice(0, 7);

  return (
    <section className="card forecast" aria-label="7 day forecast">
      <div className="forecast-title">
        <span style={{ fontSize: 20 }}>🗓️</span>
        <span>7-day Forecast</span>
      </div>
      <div className="scroller" role="list">
        {items.map((d, idx) => {
          const code = d?.weather?.[0]?.id;
          const icon = d?.weather?.[0]?.icon;
          const main = d?.weather?.[0]?.main || "";
          const desc = d?.weather?.[0]?.description || main;

          return (
            <div className="day" role="listitem" key={d.dt ?? idx}>
              <div className="dow">{toDow(d.dt)}</div>
              <div className="icon" aria-hidden>
                {icon ? (
                  <img
                    src={`https://openweathermap.org/img/wn/${icon}.png`}
                    alt={desc}
                    width={44}
                    height={44}
                    style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
                  />
                ) : (
                  <span>{codeToEmoji(code)}</span>
                )}
              </div>
              <div className="temps" aria-label={`High and low for ${toDow(d.dt)}`}>
                <span className="max">{fmtTemp(d?.temp?.max, units)}</span>
                <span className="min">{fmtTemp(d?.temp?.min, units)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Footer component
 */
function Footer() {
  return (
    <footer className="candy-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-credit">
          <span className="built-by">Built by Naveen</span>
          <span className="sep" aria-hidden> • </span>
          <span>
            Built with ❤️ using{" "}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="OpenWeatherMap API website"
            >
              OpenWeatherMap Free API
            </a>
            . Icons by OWM. No account login required.
          </span>
        </div>
      </div>
    </footer>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Candy Pop Weather Dashboard main component. No auth; uses free OpenWeatherMap endpoints with an API key from env. */
  const [units, setUnits] = useState("metric"); // 'metric' or 'imperial'
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("San Francisco");
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  const canCall = useMemo(() => {
    return Boolean(process.env.REACT_APP_OWM_API_KEY);
  }, []);

  useEffect(() => {
    // Initial load
    if (!canCall) return;
    handleSearch(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, canCall]);

  // PUBLIC_INTERFACE
  async function handleSearch(q) {
    /** Trigger search and data load for a given city name. */
    if (!q) return;
    setCity(q);
    setError("");
    setLoading(true);
    try {
      const res = await getWeatherByCity(q, units);
      setPayload(res);
    } catch (e) {
      setPayload(null);
      setError(
        e?.message?.includes("REACT_APP_OWM_API_KEY")
          ? "Missing API key. Please set REACT_APP_OWM_API_KEY in your environment."
          : e?.message || "Something went wrong fetching the weather."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="candy-app">
      <SearchHeader onSearch={handleSearch} initialCity={city} />

      <main className="main" role="main">
        <section className="card" style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <strong>Units</strong>
            <div className="helper" style={{ marginTop: 4 }}>Switch between Celsius and Fahrenheit</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="search-button"
              onClick={() => setUnits("metric")}
              aria-pressed={units === "metric"}
              aria-label="Set units to Celsius"
              style={{
                background: units === "metric" ? "var(--cp-primary)" : "rgba(167,139,250,0.35)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(244,114,182,0.35)",
              }}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setUnits("imperial")}
              aria-pressed={units === "imperial"}
              aria-label="Set units to Fahrenheit"
              style={{
                background: units === "imperial" ? "var(--cp-primary)" : "rgba(167,139,250,0.35)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(244,114,182,0.35)",
              }}
            >
              °F
            </button>
          </div>
        </section>

        {!canCall && (
          <div className="error" role="alert">
            Missing API key. Please create a .env file and set REACT_APP_OWM_API_KEY.
          </div>
        )}

        {loading && (
          <div className="loader" aria-live="polite" aria-busy="true">
            🍭 Mixing sweet forecasts...
          </div>
        )}

        {error && !loading && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && payload?.data && (
          <>
            <CurrentWeatherCard
              weather={payload.data}
              location={payload.location}
              units={units}
            />
            <ForecastScroller daily={payload.data.daily || []} units={units} />
          </>
        )}

        {!loading && !error && !payload?.data && canCall && (
          <div className="helper">Search for a city to see the weather!</div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
