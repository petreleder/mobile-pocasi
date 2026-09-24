/** Seznam weather states 1–22 (legend), day/night SVG + GIF for “now”. */

const ICON_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22,
] as const;

export type WeatherIconId = (typeof ICON_IDS)[number];

type Cover = 0 | 1 | 2 | 3;

const BY_COVER = {
  dry: [1, 2, 13, 7],
  rain: [3, 3, 14, 8],
  storm: [4, 4, 15, 9],
  sleet: [5, 5, 16, 10],
  snow: [6, 6, 17, 11],
  hail: [21, 21, 21, 22],
} as const satisfies Record<string, readonly WeatherIconId[]>;

export type WeatherIconInput = {
  precipMm: number;
  weatherCode?: number;
  clouds?: number;
  hasStorm?: boolean;
  tempC?: number;
  night?: boolean;
  animated?: boolean;
};

function coverFromClouds(clouds: number): Cover {
  if (clouds < 20) return 0;
  if (clouds < 50) return 1;
  if (clouds < 80) return 2;
  return 3;
}

function coverFromCode(code: number): Cover {
  if (code === 0) return 0;
  if (code === 1) return 1;
  if (code === 2) return 2;
  if (code === 3) return 3;
  if (code === 45 || code === 48) return 3;
  if (
    (code >= 80 && code <= 82) ||
    code === 85 ||
    code === 86 ||
    code === 95
  ) {
    return 1;
  }
  return 3;
}

function coverLevel(code?: number, clouds?: number): Cover {
  if (clouds !== undefined) return coverFromClouds(clouds);
  if (code !== undefined) return coverFromCode(code);
  return 1;
}

function pick(kind: keyof typeof BY_COVER, cover: Cover): WeatherIconId {
  return BY_COVER[kind][cover];
}

function isFog(code?: number) {
  return code === 45 || code === 48;
}

function isHail(code?: number) {
  return code === 96 || code === 99;
}

function isStormCode(code?: number) {
  return code === 95 || code === 96 || code === 99;
}

function isSnowCode(code?: number) {
  return (
    code === 71 ||
    code === 73 ||
    code === 75 ||
    code === 77 ||
    code === 85 ||
    code === 86
  );
}

function isSleetCode(code?: number) {
  return code === 56 || code === 57 || code === 66 || code === 67;
}

function isRainCode(code?: number) {
  if (code === undefined) return false;
  return (
    (code >= 51 && code <= 55) ||
    (code >= 61 && code <= 65) ||
    (code >= 80 && code <= 82)
  );
}

export function weatherIconId(input: WeatherIconInput): WeatherIconId {
  const cover = coverLevel(input.weatherCode, input.clouds);
  const raining = input.precipMm >= 0.2 || isRainCode(input.weatherCode);
  const snowing =
    isSnowCode(input.weatherCode) ||
    (raining &&
      input.weatherCode === undefined &&
      (input.tempC ?? 10) <= 0.5);
  const sleeting =
    isSleetCode(input.weatherCode) ||
    (raining &&
      !snowing &&
      input.weatherCode === undefined &&
      (input.tempC ?? 10) > 0.5 &&
      (input.tempC ?? 10) <= 2);
  const storming = Boolean(input.hasStorm) || isStormCode(input.weatherCode);

  if (isHail(input.weatherCode)) return pick("hail", cover);
  if (storming && (raining || snowing || sleeting || isStormCode(input.weatherCode))) {
    return pick("storm", cover);
  }
  if (sleeting) return pick("sleet", cover);
  if (snowing) return pick("snow", cover);
  if (raining) return pick("rain", cover);
  if (isFog(input.weatherCode)) return 12;
  return pick("dry", cover);
}

export function weatherIconSrc(input: WeatherIconInput): string {
  const id = weatherIconId(input);
  const pad = String(id).padStart(2, "0");
  const period = input.night ? "night" : "day";
  const ext = input.animated ? "gif" : "svg";
  return `/assets/weather/${period}${pad}.${ext}`;
}

export function isNightInPrague(ms = Date.now()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(ms)),
  );
  return hour < 6 || hour >= 20;
}
