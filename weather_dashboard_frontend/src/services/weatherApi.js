//
// Weather API service for OpenWeatherMap (free endpoints only)
// Uses: Direct Geocoding API (city -> lat/lon) and One Call API 3.0 (current + daily)
// Requires: REACT_APP_OWM_API_KEY set in .env
//

const BASE_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const BASE_ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall";

/**
 * Builds query string from a params object.
 */
function toQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      usp.append(k, String(v));
    }
  });
  return usp.toString();
}

/**
 * Performs a fetch with simple error handling and timeout.
 */
async function safeFetch(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
      err.details = text;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Maps weather condition codes to emoji as a playful fallback icon.
 */
export function codeToEmoji(code) {
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 400) return "🌦️";
  if (code >= 500 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code > 800 && code < 805) return "⛅";
  return "🌈";
}

// PUBLIC_INTERFACE
export async function geocodeCity(q, limit = 1) {
  /** Geocode a city name to coordinates using OpenWeatherMap Direct Geocoding API. Returns an array of matches. */
  const apiKey = process.env.REACT_APP_OWM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing REACT_APP_OWM_API_KEY environment variable.");
  }
  const qs = toQuery({ q, limit, appid: apiKey });
  const url = `${BASE_GEO_URL}?${qs}`;
  return safeFetch(url);
}

// PUBLIC_INTERFACE
export async function getWeatherByCoords({ lat, lon, units = "metric" }) {
  /** Fetch current and daily forecast for coordinates via One Call API 3.0. Returns object with current and daily arrays. */
  const apiKey = process.env.REACT_APP_OWM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing REACT_APP_OWM_API_KEY environment variable.");
  }
  const qs = toQuery({
    lat,
    lon,
    units,
    exclude: "minutely,hourly,alerts",
    appid: apiKey,
  });
  const url = `${BASE_ONECALL_URL}?${qs}`;
  return safeFetch(url);
}

// PUBLIC_INTERFACE
export async function getWeatherByCity(city, units = "metric") {
  /** Convenience: geocode city then fetch weather via onecall. Returns { location, data } */
  const places = await geocodeCity(city, 1);
  if (!places || places.length === 0) {
    const err = new Error("City not found. Try a different search.");
    err.code = "CITY_NOT_FOUND";
    throw err;
  }
  const place = places[0];
  const data = await getWeatherByCoords({ lat: place.lat, lon: place.lon, units });
  return {
    location: {
      name: place.name,
      state: place.state || "",
      country: place.country || "",
      lat: place.lat,
      lon: place.lon,
    },
    data,
  };
}
