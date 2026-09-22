"use client";

import { SwipeRow } from "./SwipeRow";
import type { WeatherInfo } from "@/lib/weather";

export function WeatherGadget({ weather }: { weather: WeatherInfo }) {
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
      <SwipeRow className="mt-3 gap-5 pr-4 pl-2">
        {weather.slots.map((slot, index) => (
          <div
            key={`${slot.label}-${index}`}
            className={`flex shrink-0 snap-start flex-col items-center gap-0.5 ${
              slot.wide ? "px-2" : "w-[60px]"
            }`}
          >
            <p className="text-center text-[12px] leading-4 whitespace-nowrap text-[#666]">
              {slot.label}
            </p>
            <span
              className={`flex items-center justify-center ${
                slot.wide ? "size-[46px]" : "h-[46px] w-10"
              }`}
            >
              <img
                src={slot.icon}
                alt=""
                draggable={false}
                className="max-w-none shrink-0"
              />
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
          </div>
        ))}
      </SwipeRow>
      <div className="mt-3 px-4">
        <div className="h-px w-full bg-[rgba(0,0,0,0.12)]" />
      </div>
    </section>
  );
}
