import {
  buildDayHighlight,
  buildDayHighlightV2,
  type DayStats,
  type WeatherHighlight,
} from "./highlight";

export type WeatherSlot = {
  label: string;
  icon: string;
  display: string;
  wide?: boolean;
  kind?: "now" | "radar" | "day";
  precipMm?: number;
};

export type WeatherInfo = {
  city: string;
  nowC: number;
  slots: WeatherSlot[];
  highlight: WeatherHighlight;
  highlightV2: WeatherHighlight;
  source: "windy" | "open-meteo";
};

export type { WeatherHighlight, WeatherMood } from "./highlight";
export { HIGHLIGHT_THEMES, HIGHLIGHT_THEMES_V2 } from "./highlight";

export function dayPrecipLabel(mm: number | undefined): string | null {
  if (mm === undefined || mm < 0.2) return null;
  if (mm >= 1) return `${Math.round(mm)} mm`;
  return `${Number(mm.toFixed(1))} mm`;
}

export const BRNO = { lat: 49.1951, lon: 16.6068, name: "Brno" };

export function windyRadarEmbedUrl(lat = BRNO.lat, lon = BRNO.lon) {
  const params = new URLSearchParams({
    lat: lat.toFixed(3),
    lon: lon.toFixed(3),
    detailLat: lat.toFixed(3),
    detailLon: lon.toFixed(3),
    width: "361",
    height: "160",
    zoom: "7",
    level: "surface",
    overlay: "radar",
    product: "radar",
    calendar: "now",
    type: "map",
    location: "coordinates",
    metricWind: "km/h",
    metricTemp: "°C",
    metricRain: "mm",
    radarRange: "-1",
    lang: "cs",
  });
  return `https://embed.windy.com/embed.html?${params.toString()}`;
}

const ICONS = {
  sun: "/assets/weather-now.svg",
  cloud: "/assets/weather-sat.svg",
  rain: "/assets/weather-afternoon.svg",
  rainAlt: "/assets/weather-thu.svg",
};

function iconFor(precipMm: number, weatherCode?: number, clouds?: number) {
  if (precipMm >= 0.2) return ICONS.rain;
  if (weatherCode !== undefined) {
    if (weatherCode >= 51) return ICONS.rain;
    if (weatherCode >= 45) return ICONS.cloud;
    if (weatherCode >= 3) return ICONS.cloud;
    return ICONS.sun;
  }
  if ((clouds ?? 0) >= 70) return ICONS.cloud;
  return ICONS.sun;
}

function roundC(value: number) {
  return Math.round(value);
}

function capitalizeCs(value: string) {
  return value.charAt(0).toLocaleUpperCase("cs-CZ") + value.slice(1);
}

function weekdayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return capitalizeCs(
    new Intl.DateTimeFormat("cs-CZ", {
      weekday: "long",
      timeZone: "Europe/Prague",
    }).format(date),
  );
}

function pragueHour(ms: number) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(ms)),
  );
}

function packHighlights(today: DayStats, tomorrow?: DayStats) {
  return {
    highlight: buildDayHighlight(today),
    highlightV2: buildDayHighlightV2(today, {
      hour: pragueHour(Date.now()),
      tomorrow,
    }),
  };
}

function pragueDateKey(ms: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

type WindyResponse = {
  ts: number[];
  "temp-surface"?: number[];
  "past3hprecip-surface"?: number[];
  "lclouds-surface"?: number[];
  "mclouds-surface"?: number[];
  "gust-surface"?: number[];
  "cape-surface"?: number[];
  "convPrecip-surface"?: number[];
};

async function fetchWindy(): Promise<WeatherInfo | null> {
  const key = process.env.WINDY_API_KEY;
  if (!key) return null;

  const response = await fetch("https://api.windy.com/api/point-forecast/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: BRNO.lat,
      lon: BRNO.lon,
      model: "gfs",
      parameters: [
        "temp",
        "precip",
        "lclouds",
        "mclouds",
        "windGust",
        "cape",
        "convPrecip",
      ],
      levels: ["surface"],
      key,
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as WindyResponse;
  const times = data.ts ?? [];
  const tempsK = data["temp-surface"] ?? [];
  const precips = data["past3hprecip-surface"] ?? [];
  const lclouds = data["lclouds-surface"] ?? [];
  const mclouds = data["mclouds-surface"] ?? [];
  const gusts = data["gust-surface"] ?? [];
  const capes = data["cape-surface"] ?? [];
  const convPrecips = data["convPrecip-surface"] ?? [];
  if (!times.length || !tempsK.length) return null;

  const now = Date.now();
  let nowIndex = 0;
  let nowDiff = Infinity;
  times.forEach((ts, index) => {
    const diff = Math.abs(ts - now);
    if (diff < nowDiff) {
      nowDiff = diff;
      nowIndex = index;
    }
  });

  const tempC = (kelvin: number) => kelvin - 273.15;
  const nowC = tempC(tempsK[nowIndex]);
  const nowPrecip = precips[nowIndex] ?? 0;
  const nowClouds = (lclouds[nowIndex] ?? 0) + (mclouds[nowIndex] ?? 0);

  const todayKey = pragueDateKey(now);
  let afternoonIndex = nowIndex;
  let afternoonDiff = Infinity;
  times.forEach((ts, index) => {
    if (pragueDateKey(ts) !== todayKey) return;
    const hour = pragueHour(ts);
    const diff = Math.abs(hour - 15);
    if (diff < afternoonDiff) {
      afternoonDiff = diff;
      afternoonIndex = index;
    }
  });

  const afternoonC = tempC(tempsK[afternoonIndex]);
  const afternoonPrecip = precips[afternoonIndex] ?? 0;
  const afternoonClouds =
    (lclouds[afternoonIndex] ?? 0) + (mclouds[afternoonIndex] ?? 0);

  let todayMaxC = nowC;
  let todayMinC = nowC;
  let todayPrecip = 0;
  let todayGustMs = 0;
  let todayCape = 0;
  let todayClouds = nowClouds;
  times.forEach((ts, index) => {
    if (pragueDateKey(ts) !== todayKey) return;
    const t = tempC(tempsK[index]);
    todayMaxC = Math.max(todayMaxC, t);
    todayMinC = Math.min(todayMinC, t);
    todayPrecip += precips[index] ?? 0;
    todayGustMs = Math.max(todayGustMs, gusts[index] ?? 0);
    todayCape = Math.max(todayCape, capes[index] ?? 0);
    todayClouds = Math.max(
      todayClouds,
      (lclouds[index] ?? 0) + (mclouds[index] ?? 0),
    );
  });
  const todayConv = convPrecips.reduce((sum, value, index) => {
    if (pragueDateKey(times[index]) !== todayKey) return sum;
    return sum + (value ?? 0);
  }, 0);

  const todayStats: DayStats = {
    maxC: todayMaxC,
    minC: todayMinC,
    precipMm: todayPrecip + todayConv,
    maxGustKmh: todayGustMs * 3.6,
    hasFog: todayClouds >= 90 && todayMinC < 12,
    hasStorm: todayCape >= 1000,
    hasShower: todayConv >= 0.5,
    cloudiness: todayClouds,
  };

  const slots: WeatherSlot[] = [
    {
      label: "Nyní",
      icon: iconFor(nowPrecip, undefined, nowClouds),
      display: `${roundC(nowC)}°C`,
      kind: "now",
    },
    {
      label: "Meteoradar",
      icon: "/assets/weather-radar.svg",
      display: `${nowPrecip.toFixed(nowPrecip >= 1 ? 0 : 1)} mm`.replace(
        ".0 mm",
        " mm",
      ),
      wide: true,
      kind: "radar",
    },
    {
      label: "Odpoledne",
      icon: iconFor(afternoonPrecip, undefined, afternoonClouds),
      display: `${roundC(afternoonC)}°C`,
    },
  ];

  const dayStats = new Map<
    string,
    {
      maxC: number;
      minC: number;
      precip: number;
      clouds: number;
      cape: number;
      conv: number;
      gustMs: number;
    }
  >();
  times.forEach((ts, index) => {
    const key = pragueDateKey(ts);
    const t = tempC(tempsK[index]);
    const precip = (precips[index] ?? 0) + (convPrecips[index] ?? 0);
    const clouds = (lclouds[index] ?? 0) + (mclouds[index] ?? 0);
    const prev = dayStats.get(key);
    if (!prev) {
      dayStats.set(key, {
        maxC: t,
        minC: t,
        precip,
        clouds,
        cape: capes[index] ?? 0,
        conv: convPrecips[index] ?? 0,
        gustMs: gusts[index] ?? 0,
      });
      return;
    }
    prev.maxC = Math.max(prev.maxC, t);
    prev.minC = Math.min(prev.minC, t);
    prev.precip += precip;
    prev.clouds = Math.max(prev.clouds, clouds);
    prev.cape = Math.max(prev.cape, capes[index] ?? 0);
    prev.conv += convPrecips[index] ?? 0;
    prev.gustMs = Math.max(prev.gustMs, gusts[index] ?? 0);
  });

  const orderedDays = [...dayStats.keys()]
    .filter((key) => key > todayKey)
    .sort();
  for (const key of orderedDays) {
    const stats = dayStats.get(key);
    if (!stats) continue;
    slots.push({
      label: weekdayLabel(key),
      icon: iconFor(stats.precip, undefined, stats.clouds),
      display: `${roundC(stats.maxC)}°C`,
      kind: "day",
      precipMm: stats.precip,
    });
  }

  const tomorrowAgg = dayStats.get(orderedDays[0]);
  const tomorrow: DayStats | undefined = tomorrowAgg
    ? {
        maxC: tomorrowAgg.maxC,
        minC: tomorrowAgg.minC,
        precipMm: tomorrowAgg.precip,
        maxGustKmh: tomorrowAgg.gustMs * 3.6,
        hasFog: tomorrowAgg.clouds >= 90 && tomorrowAgg.minC < 12,
        hasStorm: tomorrowAgg.cape >= 1000,
        hasShower: tomorrowAgg.conv >= 0.5,
        cloudiness: tomorrowAgg.clouds,
      }
    : undefined;

  return {
    city: BRNO.name,
    nowC: roundC(nowC),
    slots: slots.slice(0, 10),
    ...packHighlights(todayStats, tomorrow),
    source: "windy",
  };
}

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    weather_code: number[];
    wind_gusts_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
    wind_gusts_10m_max: number[];
  };
};

async function fetchOpenMeteo(): Promise<WeatherInfo> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(BRNO.lat));
  url.searchParams.set("longitude", String(BRNO.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,precipitation,weather_code",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,weather_code,wind_gusts_10m",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_gusts_10m_max",
  );
  url.searchParams.set("timezone", "Europe/Prague");
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url, { next: { revalidate: 600 } });
  if (!response.ok) {
    throw new Error(`Open-Meteo ${response.status}`);
  }
  const data = (await response.json()) as OpenMeteoResponse;

  const nowC = data.current.temperature_2m;
  const nowPrecip = data.current.precipitation;
  const afternoonStamp = `${data.daily.time[0]}T15:00`;
  let afternoonIndex = data.hourly.time.findIndex((time) =>
    time.startsWith(afternoonStamp),
  );
  if (afternoonIndex < 0) afternoonIndex = 15;

  const afternoonC = data.hourly.temperature_2m[afternoonIndex] ?? nowC;
  const afternoonCode = data.hourly.weather_code[afternoonIndex];
  const afternoonPrecip = data.hourly.precipitation[afternoonIndex] ?? 0;
  const todayKey = data.daily.time[0];
  const todayHourlyCodes = data.hourly.weather_code.filter(
    (_, index) => data.hourly.time[index]?.startsWith(todayKey),
  );
  const codesFor = (iso: string | undefined) =>
    iso
      ? data.hourly.weather_code.filter((_, index) =>
          data.hourly.time[index]?.startsWith(iso),
        )
      : [];
  const statsFromDaily = (index: number, codes: number[]): DayStats => ({
    maxC: data.daily.temperature_2m_max[index] ?? nowC,
    minC: data.daily.temperature_2m_min[index] ?? nowC,
    precipMm: data.daily.precipitation_sum[index] ?? 0,
    weatherCode: data.daily.weather_code[index],
    maxGustKmh: data.daily.wind_gusts_10m_max[index] ?? 0,
    hasFog: codes.some((code) => code === 45 || code === 48),
    hasStorm: codes.some((code) => code === 95 || code === 96 || code === 99),
    hasShower: codes.some((code) => code >= 80 && code <= 82),
    cloudiness:
      data.daily.weather_code[index] === 3
        ? 90
        : data.daily.weather_code[index] === 2
          ? 50
          : 20,
  });
  const todayStats = statsFromDaily(0, todayHourlyCodes);
  const tomorrowKey = data.daily.time[1];
  const tomorrow = tomorrowKey
    ? statsFromDaily(1, codesFor(tomorrowKey))
    : undefined;

  const slots: WeatherSlot[] = [
    {
      label: "Nyní",
      icon: iconFor(nowPrecip, data.current.weather_code),
      display: `${roundC(nowC)}°C`,
      kind: "now",
    },
    {
      label: "Meteoradar",
      icon: "/assets/weather-radar.svg",
      display: `${Number(nowPrecip.toFixed(nowPrecip >= 1 ? 0 : 1))} mm`,
      wide: true,
      kind: "radar",
    },
    {
      label: "Odpoledne",
      icon: iconFor(afternoonPrecip, afternoonCode),
      display: `${roundC(afternoonC)}°C`,
    },
  ];

  data.daily.time.slice(1).forEach((iso, offset) => {
    const index = offset + 1;
    slots.push({
      label: weekdayLabel(iso),
      icon: iconFor(
        data.daily.precipitation_sum[index],
        data.daily.weather_code[index],
      ),
      display: `${roundC(data.daily.temperature_2m_max[index])}°C`,
      kind: "day",
      precipMm: data.daily.precipitation_sum[index] ?? 0,
    });
  });

  return {
    city: BRNO.name,
    nowC: roundC(nowC),
    slots: slots.slice(0, 10),
    ...packHighlights(todayStats, tomorrow),
    source: "open-meteo",
  };
}

export async function getWeather(): Promise<WeatherInfo> {
  try {
    const windy = await fetchWindy();
    if (windy) return windy;
  } catch {
    // Windy key missing or request failed — live fallback below.
  }
  return fetchOpenMeteo();
}
