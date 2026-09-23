"use client";

/** pocasi-2: no gadget header, Brno nyní on the first card, daily precip totals. */

import { SwipeRow } from "./SwipeRow";
import { WeatherStripToggle } from "./WeatherStripToggle";
import {
  HIGHLIGHT_THEMES_V2,
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
}: {
  city: string;
  icon: string;
  tempC: number;
  highlight: WeatherHighlight;
}) {
  const theme = HIGHLIGHT_THEMES_V2[highlight.mood];
  return (
    <div
      className="flex h-[122px] w-[152px] shrink-0 snap-start flex-col items-start justify-center gap-0.5 pt-4 pr-2 pb-2 pl-5"
      style={{ backgroundImage: theme.background }}
    >
      <p className="text-[12px] leading-4 whitespace-nowrap">
        <span className="text-[#111]">{city}</span>
        <span className="text-[#666]"> nyní</span>
      </p>
      <div className="flex h-[46px] items-center gap-2.5">
        <img
          src={icon}
          alt=""
          draggable={false}
          className="size-10 max-w-none shrink-0"
        />
        <div className="flex items-start">
          <span className="text-center text-[26px] leading-8 font-bold text-[#111]">
            {tempC}
          </span>
          <span className="text-center text-[12px] leading-[22px] text-[#111]">
            °C
          </span>
        </div>
      </div>
      <p className="flex w-full min-h-8 flex-col justify-center text-[12px] leading-4 text-[#666]">
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
          className="size-10 max-w-none"
        />
      </span>
      {precip ? (
        <div className="flex flex-col items-center">
          <p className="text-center text-[14px] leading-4 font-bold text-[#111]">
            {slot.display}
          </p>
          <span className="flex items-center gap-0.5 text-[12px] leading-4 text-[#0066be]">
            <img
              src="/assets/weather-drop.svg"
              alt=""
              draggable={false}
              className="h-2.5 w-auto shrink-0"
            />
            {precip}
          </span>
        </div>
      ) : (
        <p className="text-center text-[14px] leading-4 font-bold whitespace-nowrap text-[#111]">
          {slot.display}
        </p>
      )}
    </div>
  );
}

export function WeatherGadgetV2({
  weather,
  toggleHref = "/pocasi",
}: {
  weather: WeatherInfo;
  toggleHref?: string;
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
