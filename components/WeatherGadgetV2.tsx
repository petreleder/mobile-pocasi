"use client";

/** pocasi-2: no gadget header, Brno nyní on the first card, daily precip totals. */

import { useState } from "react";
import { CityButton } from "./CityButton";
import { SwipeRow } from "./SwipeRow";
import { WeatherAnimIcon } from "./WeatherAnimIcon";
import { WeatherMapBackdrop } from "./WeatherMapBackdrop";
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
  mapOpen,
  onOpenCity,
  onToggleMap,
}: {
  city: string;
  icon: string;
  tempC: number;
  highlight: WeatherHighlight;
  mapOpen: boolean;
  onOpenCity: () => void;
  onToggleMap: () => void;
}) {
  const theme = HIGHLIGHT_THEMES_V2[highlight.mood];
  return (
    <div
      className="flex h-[122px] w-[152px] shrink-0 snap-start flex-col items-start justify-center gap-0.5 pt-4 pr-2 pb-2 pl-5"
      style={{ backgroundImage: theme.background }}
    >
      <p className="text-[12px] leading-4 whitespace-nowrap">
        <CityButton
          name={city}
          onOpen={onOpenCity}
          className="text-[#111]"
          chevron="none"
        />
        <span className="text-[#666]"> nyní</span>
      </p>
      <div className="flex h-[46px] items-center gap-2.5">
        <span className="relative size-10 shrink-0 overflow-visible">
          <WeatherAnimIcon
            src={icon}
            className="pointer-events-none absolute top-1/2 left-1/2 size-[52px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </span>
        <div className="flex items-start">
          <span className="text-center text-[26px] leading-8 font-bold text-[#111]">
            {tempC}
          </span>
          <span className="text-center text-[12px] leading-[22px] text-[#111]">
            °C
          </span>
        </div>
        <button
          type="button"
          aria-expanded={mapOpen}
          aria-label={mapOpen ? "Zavřít meteoradar" : "Zobrazit meteoradar"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleMap();
          }}
          className="flex size-6 shrink-0 items-center justify-center"
        >
          <img
            src="/assets/ic-chevron-right.svg"
            alt=""
            width={10}
            height={14}
            draggable={false}
            className={`transition-transform ${mapOpen ? "rotate-180" : ""}`}
          />
        </button>
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

export function WeatherGadgetV2({
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
  const [mapOpen, setMapOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  function toggleMap() {
    setMapOpen((open) => {
      if (!open) setMapReady(true);
      return !open;
    });
  }

  return (
    <section className="mt-3.5">
      <WeatherStripToggle href={toggleHref}>
        <div className="h-px w-full bg-[#ffae00]" />
        <SwipeRow>
          <div className="flex shrink-0 items-start gap-2 pr-4">
            <NowCard
              city={weather.city}
              icon={now?.icon ?? "/assets/weather-now.svg"}
              tempC={weather.nowC}
              highlight={weather.highlightV2}
              mapOpen={mapOpen}
              onOpenCity={onOpenCity}
              onToggleMap={toggleMap}
            />
            <div
              className={`mt-4 shrink-0 overflow-hidden rounded-lg transition-[width,opacity] duration-300 ease-out ${
                mapOpen ? "w-[196px] opacity-100" : "w-0 opacity-0"
              }`}
            >
              {mapReady ? (
                <div className="relative h-[98px] w-[196px] overflow-hidden rounded-lg">
                  <WeatherMapBackdrop
                    lat={weather.lat}
                    lon={weather.lon}
                    width={196}
                    height={98}
                    cityX={0.48}
                    cityY={0.5}
                    zoom={7}
                    dim={false}
                    className="pointer-events-none absolute inset-0 overflow-hidden bg-[#dce4ec]"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-start gap-4">
              {days.map((slot, index) => (
                <DayCard key={`${slot.label}-${index}`} slot={slot} />
              ))}
            </div>
          </div>
        </SwipeRow>
      </WeatherStripToggle>
    </section>
  );
}
