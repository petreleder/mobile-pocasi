"use client";

/** pocasi-3: now card on a cropped Windy radar map, white type, daily precip. */

import { CityButton } from "./CityButton";
import { SwipeRow } from "./SwipeRow";
import { WeatherAnimIcon } from "./WeatherAnimIcon";
import { WeatherMapBackdrop } from "./WeatherMapBackdrop";
import { WeatherStripToggle } from "./WeatherStripToggle";
import {
  dayPrecipLabel,
  type WeatherHighlight,
  type WeatherInfo,
  type WeatherSlot,
} from "@/lib/weather";

function NowCard({
  city,
  icon,
  tempC,
  highlight,
  lat,
  lon,
  onOpenCity,
}: {
  city: string;
  icon: string;
  tempC: number;
  highlight: WeatherHighlight;
  lat: number;
  lon: number;
  onOpenCity: () => void;
}) {
  return (
    <div className="relative flex h-[122px] w-[222px] shrink-0 snap-start flex-col items-start justify-center gap-0.5 overflow-hidden pt-4 pr-2 pb-2 pl-5">
      <WeatherMapBackdrop lat={lat} lon={lon} />
      <p className="relative z-10 text-[12px] leading-4 whitespace-nowrap">
        <CityButton
          name={city}
          onOpen={onOpenCity}
          className="text-white"
          chevron="none"
        />
        <span className="text-white"> nyní</span>
      </p>
      <div className="relative z-10 flex h-[46px] items-center gap-2.5">
        <WeatherAnimIcon
          src={icon}
          className="size-10 max-w-none shrink-0 object-contain"
        />
        <div className="flex items-start">
          <span className="text-center text-[26px] leading-8 font-bold text-white">
            {tempC}
          </span>
          <span className="text-center text-[12px] leading-[22px] text-white">
            °C
          </span>
        </div>
      </div>
      <p
        className="relative z-10 flex w-full min-h-8 flex-col justify-center text-[12px] leading-4 text-white"
        style={{ textShadow: "0 1px 2px #000, 0 0 6px rgba(0,0,0,0.7)" }}
      >
        <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {highlight.line1}
        </span>
        <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {highlight.line2}
        </span>
      </p>
    </div>
  );
}

function DayCard({ slot }: { slot: WeatherSlot }) {
  const precip = dayPrecipLabel(slot.precipMm);
  return (
    <div className="flex w-[60px] shrink-0 snap-start flex-col items-center gap-0.5 pt-4">
      <p className="text-center text-[12px] leading-4 whitespace-nowrap text-[#666]">
        {slot.label}
      </p>
      <span className="relative flex h-[46px] w-10 items-center justify-center">
        <img
          src={slot.icon}
          alt=""
          draggable={false}
          className="size-10 max-w-none object-contain"
        />
      </span>
      {precip ? (
        <div className="flex flex-col items-center">
          <p className="text-center text-[14px] leading-4 font-bold text-[#111]">
            {slot.display}
          </p>
          <span className="flex items-center gap-[3px] text-[12px] leading-4 text-[#0066be]">
            <img
              src="/assets/weather-drop.svg"
              alt=""
              width={6}
              height={9}
              draggable={false}
              className="shrink-0"
            />
            {precip}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-center text-[14px] leading-4 font-bold whitespace-nowrap text-[#111]">
            {slot.display}
          </p>
          {slot.minC !== undefined ? (
            <p className="text-center text-[12px] leading-4 whitespace-nowrap text-[#666]">
              {slot.minC}°C
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function WeatherGadgetV3({
  weather,
  toggleHref = "/pocasi",
  onOpenCity,
}: {
  weather: WeatherInfo;
  toggleHref?: string;
  onOpenCity: () => void;
}) {
  const now = weather.slots.find((slot) => slot.kind === "now");
  const days = weather.slots.filter((slot) => slot.kind === "day");

  return (
    <section className="mt-3.5">
      <WeatherStripToggle href={toggleHref}>
        <div className="h-px w-full bg-[#ffae00]" />
        <SwipeRow>
          <div className="flex shrink-0 items-start gap-4 pr-4">
            <NowCard
              city={weather.city}
              icon={now?.icon ?? "/assets/weather-now.svg"}
              tempC={weather.nowC}
              highlight={weather.highlightV2}
              lat={weather.lat}
              lon={weather.lon}
              onOpenCity={onOpenCity}
            />
            {days.map((slot, index) => (
              <DayCard key={`${slot.label}-${index}`} slot={slot} />
            ))}
          </div>
        </SwipeRow>
      </WeatherStripToggle>
    </section>
  );
}
