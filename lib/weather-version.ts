export type WeatherVersion = "pocasi-1" | "pocasi-2" | "pocasi-3";

export const WEATHER_HREF: Record<WeatherVersion, string> = {
  "pocasi-1": "/pocasi",
  "pocasi-2": "/pocasi-2",
  "pocasi-3": "/pocasi-3",
};

export const DEFAULT_WEATHER_VERSION: WeatherVersion = "pocasi-2";
const ORDER: WeatherVersion[] = ["pocasi-2", "pocasi-1", "pocasi-3"];
const STORAGE_KEY = "pocasi-version";

export function otherWeatherHref(version: WeatherVersion) {
  const index = ORDER.indexOf(version);
  return WEATHER_HREF[ORDER[(index + 1) % ORDER.length]];
}

export function rememberWeatherVersion(version: WeatherVersion) {
  try {
    sessionStorage.setItem(STORAGE_KEY, version);
  } catch {
    // Private mode / blocked storage.
  }
}

export function lastWeatherHref() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "pocasi-1" || stored === "pocasi-2" || stored === "pocasi-3") {
      return WEATHER_HREF[stored];
    }
  } catch {
    // Fall through to default.
  }
  return WEATHER_HREF[DEFAULT_WEATHER_VERSION];
}
