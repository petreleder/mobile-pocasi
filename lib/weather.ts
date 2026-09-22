export type WeatherSlot = {
  label: string;
  icon: string;
  display: string;
  wide?: boolean;
};

export type WeatherInfo = {
  city: string;
  nowC: number;
  slots: WeatherSlot[];
  source: "windy" | "open-meteo";
};

const BRNO = { lat: 49.1951, lon: 16.6068, name: "Brno" };

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
      parameters: ["temp", "precip", "lclouds", "mclouds"],
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

  const slots: WeatherSlot[] = [
    {
      label: "Nyní",
      icon: iconFor(nowPrecip, undefined, nowClouds),
      display: `${roundC(nowC)}°C`,
    },
    {
      label: "Meteoradar",
      icon: "/assets/weather-radar.svg",
      display: `${nowPrecip.toFixed(nowPrecip >= 1 ? 0 : 1)} mm`.replace(
        ".0 mm",
        " mm",
      ),
      wide: true,
    },
    {
      label: "Odpoledne",
      icon: iconFor(afternoonPrecip, undefined, afternoonClouds),
      display: `${roundC(afternoonC)}°C`,
    },
  ];

  const seenDays = new Set<string>([todayKey]);
  times.forEach((ts, index) => {
    const key = pragueDateKey(ts);
    if (seenDays.has(key)) return;
    const hour = pragueHour(ts);
    if (hour < 12 || hour > 15) return;
    seenDays.add(key);
    const precip = precips[index] ?? 0;
    const clouds = (lclouds[index] ?? 0) + (mclouds[index] ?? 0);
    slots.push({
      label: weekdayLabel(key),
      icon: iconFor(precip, undefined, clouds),
      display: `${roundC(tempC(tempsK[index]))}°C`,
    });
  });

  return {
    city: BRNO.name,
    nowC: roundC(nowC),
    slots: slots.slice(0, 8),
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
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    weather_code: number[];
    precipitation_sum: number[];
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
    "temperature_2m,precipitation,weather_code",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,weather_code,precipitation_sum",
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

  const slots: WeatherSlot[] = [
    {
      label: "Nyní",
      icon: iconFor(nowPrecip, data.current.weather_code),
      display: `${roundC(nowC)}°C`,
    },
    {
      label: "Meteoradar",
      icon: "/assets/weather-radar.svg",
      display: `${Number(nowPrecip.toFixed(nowPrecip >= 1 ? 0 : 1))} mm`,
      wide: true,
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
    });
  });

  return {
    city: BRNO.name,
    nowC: roundC(nowC),
    slots: slots.slice(0, 8),
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
