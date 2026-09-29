"use client";

import { useEffect, useState } from "react";
import { CitySheet } from "./CitySheet";
import { EmailGadget } from "./EmailGadget";
import { Header } from "./Header";
import { NameDay } from "./NameDay";
import { NewsTeaser } from "./NewsTeaser";
import { SearchBar } from "./SearchBar";
import { ServiceCarousel, type ServiceId } from "./ServiceCarousel";
import { WeatherGadget } from "./WeatherGadget";
import { WeatherGadgetV2 } from "./WeatherGadgetV2";
import { WeatherGadgetV3 } from "./WeatherGadgetV3";
import { cityFromId, type City } from "@/lib/cities";
import { rememberCity, storedCityId } from "@/lib/city-preference";
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
  const [currentWeather, setCurrentWeather] = useState(weather);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cityBusy, setCityBusy] = useState(false);

  useEffect(() => {
    setCurrentWeather(weather);
  }, [weather]);

  useEffect(() => {
    if (variant === "weather") {
      rememberWeatherVersion(weatherVersion);
      setWeatherHref(WEATHER_HREF[weatherVersion]);
      return;
    }
    setWeatherHref(lastWeatherHref());
  }, [variant, weatherVersion]);

  useEffect(() => {
    const stored = storedCityId();
    if (!stored || stored === currentWeather.cityId) return;
    const city = cityFromId(stored);
    if (city) void applyCity(city, false);
    // Only reconcile localStorage vs SSR cookie on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyCity(city: City, closePicker = true) {
    rememberCity(city.id);
    setCityBusy(true);
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city.id)}`,
      );
      if (!response.ok) throw new Error(String(response.status));
      const next = (await response.json()) as WeatherInfo;
      setCurrentWeather(next);
      if (closePicker) setPickerOpen(false);
    } catch {
      // Keep the previous forecast visible.
    } finally {
      setCityBusy(false);
    }
  }

  const toggleHref = otherWeatherHref(weatherVersion);
  const gadgetProps = {
    weather: currentWeather,
    toggleHref,
    onOpenCity: () => setPickerOpen(true),
  };

  return (
    <div className="flex min-h-dvh justify-center bg-white">
      <div id="home-screen" className="w-full max-w-[393px] min-h-dvh bg-white">
        <Header />
        <SearchBar />
        <ServiceCarousel
          activeId={variant}
          weatherHref={weatherHref}
          weatherLabel={`${currentWeather.nowC}°C`}
          weatherIcon={
            currentWeather.slots.find((slot) => slot.kind === "now")?.icon ??
            "/assets/weather-now.svg"
          }
        />
        {variant === "weather" ? (
          weatherVersion === "pocasi-3" ? (
            <WeatherGadgetV3 {...gadgetProps} />
          ) : weatherVersion === "pocasi-2" ? (
            <WeatherGadgetV2 {...gadgetProps} />
          ) : (
            <WeatherGadget {...gadgetProps} />
          )
        ) : (
          <EmailGadget />
        )}
        <NameDay
          {...nameday}
          className={variant === "weather" ? "mt-6" : "mt-4"}
        />
        <NewsTeaser />
        <CitySheet
          open={pickerOpen}
          selectedId={currentWeather.cityId}
          busy={cityBusy}
          onClose={() => setPickerOpen(false)}
          onSelect={(city) => void applyCity(city)}
        />
      </div>
    </div>
  );
}
