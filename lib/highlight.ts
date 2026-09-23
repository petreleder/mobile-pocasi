export type WeatherMood = "sun" | "cloud" | "storm";

export type WeatherHighlight = {
  mood: WeatherMood;
  line1: string;
  line2: string;
};

export type DayStats = {
  maxC: number;
  minC: number;
  precipMm: number;
  weatherCode?: number;
  maxGustKmh: number;
  hasFog: boolean;
  hasStorm: boolean;
  hasShower: boolean;
  cloudiness?: number;
};

export const HIGHLIGHT_THEMES: Record<
  WeatherMood,
  { background: string; border: string }
> = {
  sun: {
    background:
      "linear-gradient(136deg, rgb(255, 255, 255) 0%, rgb(249, 243, 226) 76%)",
    border: "#f8f2e1",
  },
  cloud: {
    background:
      "linear-gradient(136deg, rgb(255, 255, 255) 0%, rgb(232, 240, 247) 76%)",
    border: "#dce8f0",
  },
  storm: {
    background:
      "linear-gradient(136deg, rgb(255, 255, 255) 0%, rgb(214, 218, 226) 76%)",
    border: "#c5cad3",
  },
};

function roundC(value: number) {
  return Math.round(value);
}

function isStormCode(code?: number) {
  return code === 95 || code === 96 || code === 99;
}

function isRainCode(code?: number) {
  if (code === undefined) return false;
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

function isSnowCode(code?: number) {
  if (code === undefined) return false;
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

export function moodFromStats(stats: DayStats): WeatherMood {
  if (stats.hasStorm || isStormCode(stats.weatherCode)) return "storm";
  if (
    stats.hasShower ||
    stats.precipMm >= 0.2 ||
    isRainCode(stats.weatherCode) ||
    isSnowCode(stats.weatherCode) ||
    stats.hasFog ||
    stats.weatherCode === 3 ||
    (stats.cloudiness ?? 0) >= 70
  ) {
    return "cloud";
  }
  return "sun";
}

export function buildDayHighlight(stats: DayStats): WeatherHighlight {
  const maxC = roundC(stats.maxC);
  const precip = Math.round(stats.precipMm);
  const gusts = Math.round(stats.maxGustKmh);
  const mood = moodFromStats(stats);

  if (stats.hasStorm || isStormCode(stats.weatherCode)) {
    return { mood, line1: "Odpoledne bouřky", line2: `až ${maxC} °C` };
  }
  if (stats.hasShower) {
    return { mood, line1: "Přeháňky odpoledne", line2: `až ${maxC} °C` };
  }
  if (stats.precipMm >= 10 || (isRainCode(stats.weatherCode) && stats.precipMm >= 5)) {
    return { mood, line1: "Intenzivní déšť", line2: `až ${precip} mm` };
  }
  if (stats.precipMm >= 0.2 || isRainCode(stats.weatherCode)) {
    return { mood, line1: "Dnes déšť", line2: `až ${maxC} °C` };
  }
  if (isSnowCode(stats.weatherCode)) {
    return { mood, line1: "Sněžení", line2: `až ${maxC} °C` };
  }
  if (stats.hasFog) {
    return { mood, line1: "Ráno mlha", line2: `až ${maxC} °C` };
  }
  if (gusts >= 70) {
    return { mood, line1: "Silný vítr", line2: `nárazy až ${gusts} km/h` };
  }
  if (gusts >= 50) {
    return { mood, line1: "Větrno", line2: `nárazy až ${gusts} km/h` };
  }
  if (maxC >= 28 && stats.precipMm < 0.2 && (stats.cloudiness ?? 0) < 50) {
    return { mood, line1: "Sucho, pozor na oheň", line2: `až ${maxC} °C` };
  }
  if (stats.minC <= 0) {
    return { mood, line1: "Ráno mrazíky", line2: `přes den až ${maxC} °C` };
  }
  if (mood === "cloud") {
    return { mood, line1: "Zataženo", line2: `max. ${maxC} °C` };
  }
  if (maxC >= 20) {
    return { mood, line1: `Dnes příjemných ${maxC} °C`, line2: "bez srážek" };
  }
  return { mood, line1: `Přes den až ${maxC} °C`, line2: "bez srážek" };
}
