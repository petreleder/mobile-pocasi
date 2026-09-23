export type WeatherVersion = "pocasi-1" | "pocasi-2";

export const WEATHER_HREF: Record<WeatherVersion, string> = {
  "pocasi-1": "/pocasi",
  "pocasi-2": "/pocasi-2",
};

const STORAGE_KEY = "pocasi-version";

export function otherWeatherHref(version: WeatherVersion) {
  return version === "pocasi-2"
    ? WEATHER_HREF["pocasi-1"]
    : WEATHER_HREF["pocasi-2"];
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
    if (stored === "pocasi-2") return WEATHER_HREF["pocasi-2"];
  } catch {
    // Fall through to default.
  }
  return WEATHER_HREF["pocasi-1"];
}
