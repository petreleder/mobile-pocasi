"use client";

import { EmailGadget } from "./EmailGadget";
import { Header } from "./Header";
import { NameDay } from "./NameDay";
import { NewsTeaser } from "./NewsTeaser";
import { SearchBar } from "./SearchBar";
import { ServiceCarousel, type ServiceId } from "./ServiceCarousel";
import { WeatherGadget } from "./WeatherGadget";
import type { NameDayInfo } from "@/lib/nameday";
import type { WeatherInfo } from "@/lib/weather";

export function HomePage({
  variant = "email",
  nameday,
  weather,
}: {
  variant?: ServiceId;
  nameday: NameDayInfo;
  weather: WeatherInfo;
}) {
  return (
    <div className="flex min-h-full justify-center bg-white">
      <div id="home-screen" className="w-full max-w-[375px] bg-white">
        <Header />
        <SearchBar />
        <ServiceCarousel
          activeId={variant}
          weatherLabel={`${weather.nowC}°C`}
        />
        {variant === "weather" ? (
          <WeatherGadget weather={weather} />
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
