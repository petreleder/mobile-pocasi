"use client";

import { useState } from "react";
import { SwipeRow } from "./SwipeRow";
import {
  HIGHLIGHT_THEMES,
  windyRadarEmbedUrl,
  type WeatherHighlight,
  type WeatherInfo,
} from "@/lib/weather";

function NowCard({
  icon,
  tempC,
  highlight,
}: {
  icon: string;
  tempC: number;
  highlight: WeatherHighlight;
}) {
  const theme = HIGHLIGHT_THEMES[highlight.mood];
  return (
    <div
      className="flex min-w-[158px] shrink-0 snap-start flex-col items-start justify-center gap-1.5 rounded-xl border border-solid px-3 py-2"
      style={{
        borderColor: theme.border,
        backgroundImage: theme.background,
      }}
    >
      <div className="flex items-end gap-2.5 pl-1">
        <span className="relative flex h-12 w-[54px] items-center justify-center">
          <img src={icon} alt="" draggable={false} className="max-w-none" />
        </span>
        <div className="flex flex-col items-start">
          <p className="pl-0.5 text-[12px] leading-4 text-[#666]">nyní</p>
          <div className="flex items-start">
            <span className="text-[24px] leading-[30px] font-bold text-[#111]">
              {tempC}
            </span>
            <span className="text-[12px] leading-[22px] text-[#111]">°C</span>
          </div>
        </div>
      </div>
      <p className="px-1 text-[12px] leading-4 whitespace-nowrap text-[#666]">
        {highlight.line1}
        <br />
        {highlight.line2}
      </p>
    </div>
  );
}

export function WeatherGadget({ weather }: { weather: WeatherInfo }) {
  const [radarOpen, setRadarOpen] = useState(false);

  return (
    <section className="mt-3.5">
      <div className="h-px w-full bg-[#ffae00]" />
      <div className="flex items-center justify-between px-4 pt-[5px]">
        <div className="flex items-center gap-1.5 text-[14px] whitespace-nowrap">
          <span className="font-bold leading-[22px] text-[#111]">Počasí</span>
          <span className="leading-5 text-[#ccc]">•</span>
          <span className="leading-5 text-[#666]">{weather.city}</span>
        </div>
        <button
          type="button"
          className="flex size-8 items-center justify-center"
          aria-label="Další"
        >
          <img src="/assets/icon-overflow.svg" alt="" className="rotate-90" />
        </button>
      </div>
      <div className="mt-1 px-4">
        <div className="h-px w-full bg-[rgba(0,0,0,0.12)]" />
      </div>
      <SwipeRow className="mt-1 items-center gap-4 pr-4 pl-4">
        {weather.slots.map((slot, index) => {
          if (slot.kind === "now") {
            return (
              <NowCard
                key={`${slot.label}-${index}`}
                icon={slot.icon}
                tempC={weather.nowC}
                highlight={weather.highlight}
              />
            );
          }

          const isRadar = slot.kind === "radar";
          const selected = isRadar && radarOpen;
          const className = `flex shrink-0 snap-start flex-col items-center gap-0.5 rounded-lg p-2 ${
            selected ? "bg-black/[0.06]" : ""
          } ${slot.wide ? "" : "w-[60px]"}`;
          const inner = (
            <>
              <p className="text-center text-[12px] leading-4 whitespace-nowrap text-[#666]">
                {slot.label}
              </p>
              <span
                className={`relative flex items-center justify-center ${
                  slot.wide ? "size-[46px]" : "h-[46px] w-10"
                }`}
              >
                {selected ? (
                  <span className="relative size-9 overflow-hidden">
                    <img
                      src={slot.icon}
                      alt=""
                      draggable={false}
                      className="max-w-none shrink-0"
                    />
                    <img
                      src="/assets/weather-radar-bg.svg"
                      alt=""
                      draggable={false}
                      className="absolute inset-0 max-w-none"
                    />
                    <span className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2">
                      <img
                        src="/assets/weather-radar-close.svg"
                        alt=""
                        draggable={false}
                      />
                    </span>
                  </span>
                ) : (
                  <img
                    src={slot.icon}
                    alt=""
                    draggable={false}
                    className="max-w-none shrink-0"
                  />
                )}
              </span>
              <div
                className={`text-center text-[14px] leading-4 font-bold whitespace-nowrap ${
                  slot.wide ? "text-[#0066be]" : "text-[#111]"
                }`}
              >
                {slot.wide ? (
                  <span className="flex items-center gap-0.5">
                    <img
                      src="/assets/weather-drop.svg"
                      alt=""
                      draggable={false}
                    />
                    {slot.display}
                  </span>
                ) : (
                  slot.display
                )}
              </div>
            </>
          );

          if (isRadar) {
            return (
              <button
                key={`${slot.label}-${index}`}
                type="button"
                className={className}
                aria-pressed={radarOpen}
                aria-label={
                  radarOpen ? "Zavřít meteoradar" : "Zobrazit meteoradar"
                }
                onClick={() => setRadarOpen((open) => !open)}
              >
                {inner}
              </button>
            );
          }

          return (
            <div key={`${slot.label}-${index}`} className={className}>
              {inner}
            </div>
          );
        })}
      </SwipeRow>
      <div className="mt-1 px-4">
        <div className="h-px w-full bg-[rgba(0,0,0,0.12)]" />
        {radarOpen ? (
          <div className="mt-3 overflow-hidden rounded-lg">
            <iframe
              title="Windy meteoradar"
              src={windyRadarEmbedUrl()}
              className="block h-40 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="fullscreen"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
