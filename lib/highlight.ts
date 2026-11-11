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

export const HIGHLIGHT_THEMES_V2: Record<WeatherMood, { background: string }> =
  {
    sun: {
      background:
        "radial-gradient(110% 100% at 0% 0%, rgb(247, 237, 210) 0%, rgb(255, 255, 255) 78%)",
    },
    cloud: {
      background:
        "radial-gradient(110% 100% at 0% 0%, rgb(214, 230, 244) 0%, rgb(255, 255, 255) 78%)",
    },
    storm: {
      background:
        "radial-gradient(110% 100% at 0% 0%, rgb(200, 207, 218) 0%, rgb(255, 255, 255) 78%)",
    },
  };

function roundC(value: number) {
  return Math.round(value);
}

export type HighlightContext = {
  hour: number;
  tomorrow?: DayStats;
};

const V2_LINE_MAX = 23;

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

function firstFit(...candidates: string[]) {
  const fit = candidates.find(
    (line) => line.length > 0 && line.length <= V2_LINE_MAX,
  );
  if (fit) return fit;
  return candidates.find((line) => line.length > 0) ?? "";
}

function skyKind(stats: DayStats) {
  if (stats.hasStorm || isStormCode(stats.weatherCode)) return "storm" as const;
  if (stats.hasShower) return "shower" as const;
  if (stats.precipMm >= 10) return "heavy-rain" as const;
  if (stats.precipMm >= 0.2 || isRainCode(stats.weatherCode)) return "rain" as const;
  if (isSnowCode(stats.weatherCode)) return "snow" as const;
  if (stats.hasFog) return "fog" as const;
  if ((stats.cloudiness ?? 0) >= 70 || stats.weatherCode === 3) return "overcast" as const;
  if ((stats.cloudiness ?? 0) >= 40 || (stats.weatherCode ?? 0) >= 2) {
    return "partly" as const;
  }
  return "sun" as const;
}

function tempSpan(stats: DayStats) {
  const min = roundC(stats.minC);
  const max = roundC(stats.maxC);
  if (min === max) return `${max} °C`;
  return `${min} až ${max} °C`;
}

function todayLines(stats: DayStats): Pick<WeatherHighlight, "line1" | "line2"> {
  const sky = skyKind(stats);
  const span = tempSpan(stats);
  const max = roundC(stats.maxC);
  const precip = Math.round(stats.precipMm);
  const gusts = Math.round(stats.maxGustKmh);
  const dry = stats.precipMm < 0.2 && !isRainCode(stats.weatherCode);

  const line1 = firstFit(
    sky === "storm" ? "Dnes odpoledne bouřky" : "",
    sky === "storm" ? "Dnes budou bouřky" : "",
    sky === "shower" ? "Dnes budou přeháňky" : "",
    sky === "heavy-rain" ? "Dnes intenzivní déšť" : "",
    sky === "rain" ? "Dnes zataženo, déšť" : "",
    sky === "rain" ? "Dnes bude pršet" : "",
    sky === "snow" ? "Dnes bude sněžit" : "",
    sky === "fog" ? "Dnes ráno mlha, pak zataženo" : "",
    sky === "fog" ? "Dnes ráno bude mlha" : "",
    stats.minC <= 0 ? "Dnes ráno hrozí mrazíky" : "",
    gusts >= 70 ? "Dnes bude silný vítr" : "",
    sky === "overcast" ? "Dnes bude zataženo" : "",
    sky === "partly" ? "Dnes bude polojasno" : "",
    max >= 20 && dry ? "Dnes bude pěkně teplo" : "",
    max >= 20 && dry ? "Dnes bude příjemně" : "",
    sky === "sun" ? "Dnes bude slunečno" : "",
    "Dnes bude oblačno",
  );

  const line2 = firstFit(
    dry && gusts >= 50 ? `${span}, silný vítr` : "",
    dry ? `${span}, bez deště` : "",
    precip >= 1 ? `${span}, déšť ${precip} mm` : "",
    !dry ? `${span}, budou srážky` : "",
    span,
  );

  return { line1, line2 };
}

function eveningLines(
  today: DayStats,
  tomorrow: DayStats,
): Pick<WeatherHighlight, "line1" | "line2"> {
  const todayMax = roundC(today.maxC);
  const tomorrowMax = roundC(tomorrow.maxC);
  const delta = tomorrowMax - todayMax;
  const warmer = delta >= 2;
  const colder = delta <= -2;
  const sky = skyKind(tomorrow);
  const span = tempSpan(tomorrow);
  const precip = Math.round(tomorrow.precipMm);
  const todayWet = today.precipMm >= 0.2 || isRainCode(today.weatherCode);
  const tomorrowWet =
    tomorrow.precipMm >= 0.2 || isRainCode(tomorrow.weatherCode);

  const line1 = firstFit(
    sky === "storm" ? "Zítra odpoledne bouřky" : "",
    sky === "storm" ? "Zítra hrozí bouřky" : "",
    sky === "shower" && warmer ? "Zítra tepleji, přeháňky" : "",
    sky === "shower" ? "Zítra budou přeháňky" : "",
    tomorrowWet && !todayWet && warmer ? "Zítra tepleji, ale déšť" : "",
    tomorrowWet && !todayWet && colder ? "Zítra déšť a chladněji" : "",
    tomorrowWet && !todayWet ? "Zítra bude pršet" : "",
    todayWet && !tomorrowWet && warmer ? "Zítra tepleji a vysvitne" : "",
    todayWet && !tomorrowWet ? "Zítra už bez deště" : "",
    warmer ? "Zítra tepleji než dnes" : "",
    colder ? "Zítra bude chladněji" : "",
    sky === "sun" ? "Zítra bude slunečno" : "",
    sky === "overcast" ? "Zítra bude zataženo" : "",
    "Zítra podobně jako dnes",
  );

  const line2 = firstFit(
    sky === "storm" ? `${span}, bouřky a déšť` : "",
    precip >= 1 ? `${span}, déšť ${precip} mm` : "",
    tomorrowWet ? `${span}, bude pršet` : "",
    warmer && sky === "sun" ? `slunečno, až ${tomorrowMax} °C` : "",
    colder ? `${span}, spíš zataženo` : "",
    sky === "overcast" ? `zataženo, ${span}` : "",
    sky === "partly" ? `polojasno, ${span}` : "",
    sky === "sun" ? `slunečno, až ${tomorrowMax} °C` : "",
    `${span}, bez deště`,
  );

  return { line1, line2 };
}

export function buildDayHighlightV2(
  today: DayStats,
  ctx: HighlightContext,
): WeatherHighlight {
  const mood = moodFromStats(today);
  const lines =
    ctx.hour >= 21 && ctx.tomorrow
      ? eveningLines(today, ctx.tomorrow)
      : todayLines(today);
  return { mood, ...lines };
}
