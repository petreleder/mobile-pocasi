"use client";

import { useEffect, useState } from "react";
import { EmailGadget } from "./EmailGadget";
import { Header } from "./Header";
import { NameDay } from "./NameDay";
import { NewsTeaser } from "./NewsTeaser";
import { SearchBar } from "./SearchBar";
import { ServiceCarousel, type ServiceId } from "./ServiceCarousel";
import { WeatherGadget } from "./WeatherGadget";
import { WeatherGadgetV2 } from "./WeatherGadgetV2";
import { WeatherGadgetV3 } from "./WeatherGadgetV3";
import type { NameDayInfo } from "@/lib/nameday";
import type { WeatherInfo } from "@/lib/weather";
import {
  lastWeatherHref,
  otherWeatherHref,
  rememberWeatherVersion,
  WEATHER_HREF,
  type WeatherVersion,
} from "@/lib/weather-version";

export type { WeatherVersion };

export function HomePage({
  variant = "email",
  weatherVersion = "pocasi-1",
  nameday,
  weather,
}: {
  variant?: ServiceId;
  weatherVersion?: WeatherVersion;
  nameday: NameDayInfo;
  weather: WeatherInfo;
}) {
  const [weatherHref, setWeatherHref] = useState(
    WEATHER_HREF[weatherVersion],
  );

  useEffect(() => {
    if (variant === "weather") {
      rememberWeatherVersion(weatherVersion);
      setWeatherHref(WEATHER_HREF[weatherVersion]);
      return;
    }
    setWeatherHref(lastWeatherHref());
  }, [variant, weatherVersion]);

  const toggleHref = otherWeatherHref(weatherVersion);

  return (
    <div className="flex min-h-dvh justify-center bg-white">
      <div id="home-screen" className="w-full max-w-[393px] min-h-dvh bg-white">
        <Header />
        <SearchBar />
        <ServiceCarousel
          activeId={variant}
          weatherHref={weatherHref}
          weatherLabel={`${weather.nowC}°C`}
          weatherIcon={
            weather.slots.find((slot) => slot.kind === "now")?.icon ??
            "/assets/weather-now.svg"
          }
        />
        {variant === "weather" ? (
          weatherVersion === "pocasi-3" ? (
            <WeatherGadgetV3 weather={weather} toggleHref={toggleHref} />
          ) : weatherVersion === "pocasi-2" ? (
            <WeatherGadgetV2 weather={weather} toggleHref={toggleHref} />
          ) : (
            <WeatherGadget weather={weather} toggleHref={toggleHref} />
          )
        ) : (
          <EmailGadget />
        )}
        <NameDay
          {...nameday}
          className={variant === "weather" ? "mt-6" : "mt-4"}
        />
        <NewsTeaser />
      </div>
    </div>
  );
}
