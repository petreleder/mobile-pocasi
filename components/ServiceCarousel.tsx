"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SwipeRow } from "./SwipeRow";
import { WeatherAnimIcon } from "./WeatherAnimIcon";

export type ServiceId = "email" | "weather";

type Service = {
  id: string;
  label?: string;
  href?: string;
  renderIcon: () => ReactNode;
};

function CircleIcon({ src }: { src: string }) {
  return (
    <img src={src} alt="" draggable={false} className="max-w-none shrink-0" />
  );
}

function WeatherIcon({ src }: { src: string }) {
  return (
    <span className="relative flex size-9 items-center justify-center overflow-visible">
      <WeatherAnimIcon
        src={src}
        className="size-9 max-w-none shrink-0 object-contain"
      />
    </span>
  );
}

function TvIcon() {
  return (
    <span className="size-9 overflow-hidden rounded-[10px]">
      <img
        src="/assets/icon-tv.png"
        alt=""
        width={36}
        height={36}
        draggable={false}
        className="block size-9 object-cover"
      />
    </span>
  );
}

function TransitIcon() {
  return (
    <span className="relative size-9">
      <img src="/assets/icon-jizdnirady-bg.svg" alt="" draggable={false} />
      <span className="absolute inset-0 flex items-center justify-center">
        <img src="/assets/icon-jizdnirady.svg" alt="" draggable={false} />
      </span>
    </span>
  );
}

function ScaledIcon({ src, size }: { src: string; size: 32 | 36 }) {
  const native = 44;
  const scale = size / native;
  return (
    <span
      className="relative overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      />
    </span>
  );
}

function DenikyIcon() {
  const scale = 36 / 44;
  return (
    <span className="relative size-9 overflow-hidden">
      <img
        src="/assets/icon-deniky.svg"
        alt=""
        draggable={false}
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      />
      <span
        className="absolute overflow-hidden"
        style={{
          top: "4.55%",
          right: "4.55%",
          bottom: "4.55%",
          left: "4.55%",
        }}
      >
        <span
          className="absolute"
          style={{
            top: "15%",
            right: "21.25%",
            bottom: "15%",
            left: "21.25%",
          }}
        >
          <img src="/assets/icon-deniky-mark.svg" alt="" draggable={false} />
        </span>
      </span>
    </span>
  );
}

const services: Service[] = [
  {
    id: "email",
    label: "Email",
    href: "/",
    renderIcon: () => <CircleIcon src="/assets/icon-email.svg" />,
  },
  {
    id: "weather",
    href: "/pocasi",
    renderIcon: () => <WeatherIcon src="/assets/weather-now.svg" />,
  },
  {
    id: "tv",
    label: "TV program",
    renderIcon: () => <TvIcon />,
  },
  {
    id: "mapy",
    label: "Mapy",
    renderIcon: () => <CircleIcon src="/assets/icon-mapy.svg" />,
  },
  {
    id: "transit",
    label: "Jízdní řády",
    renderIcon: () => <TransitIcon />,
  },
  {
    id: "bazar",
    label: "Bazar",
    renderIcon: () => <CircleIcon src="/assets/icon-bazar.svg" />,
  },
  {
    id: "podcasty",
    label: "Podcasty",
    renderIcon: () => <CircleIcon src="/assets/icon-podcasty.svg" />,
  },
  {
    id: "auto",
    label: "Auto",
    renderIcon: () => <CircleIcon src="/assets/icon-auto.svg" />,
  },
  {
    id: "slovnik",
    label: "Slovník",
    renderIcon: () => <ScaledIcon src="/assets/icon-slovnik.svg" size={36} />,
  },
  {
    id: "reality",
    label: "Reality",
    renderIcon: () => <ScaledIcon src="/assets/icon-reality.svg" size={36} />,
  },
  {
    id: "letaky",
    label: "Letáky",
    renderIcon: () => <ScaledIcon src="/assets/icon-kupi.svg" size={36} />,
  },
  {
    id: "apps",
    label: "Mobilní aplikace",
    renderIcon: () => (
      <ScaledIcon src="/assets/icon-tvprogram-v2.svg" size={36} />
    ),
  },
  {
    id: "recepty",
    label: "Recepty",
    renderIcon: () => <ScaledIcon src="/assets/icon-recepty.svg" size={36} />,
  },
  {
    id: "deniky",
    label: "Deníky",
    renderIcon: () => <DenikyIcon />,
  },
];

function itemClass(active: boolean, isWeather: boolean) {
  if (active) return "font-bold text-[#c00]";
  if (isWeather) return "text-[#767676]";
  return "text-[#888]";
}

export function ServiceCarousel({
  activeId = "email",
  weatherHref = "/pocasi",
  weatherLabel = "–",
  weatherIcon = "/assets/weather-now.svg",
}: {
  activeId?: ServiceId;
  weatherHref?: string;
  weatherLabel?: string;
  weatherIcon?: string;
}) {
  return (
    <SwipeRow className="mt-8 scroll-pl-4">
      <div className="flex shrink-0 items-start gap-4 pr-4 pl-4">
      {services.map((service) => {
        const active = service.id === activeId;
        const className = `flex min-w-12 shrink-0 snap-start flex-col items-center gap-1.5`;
        const label =
          service.id === "weather" ? weatherLabel : (service.label ?? "");
        const icon =
          service.id === "weather" ? (
            <WeatherIcon src={weatherIcon} />
          ) : (
            service.renderIcon()
          );
        const href =
          service.id === "weather" ? weatherHref : service.href;
        const inner = (
          <>
            <span className="flex size-9 items-center justify-center overflow-visible">
              {icon}
            </span>
            <span
              className={`text-[12px] leading-[1.3] whitespace-nowrap ${itemClass(
                active,
                service.id === "weather",
              )}`}
            >
              {label}
            </span>
          </>
        );

        if (href) {
          return (
            <Link
              key={service.id}
              href={href}
              className={className}
              aria-current={active ? "page" : undefined}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button key={service.id} type="button" className={className}>
            {inner}
          </button>
        );
      })}
      </div>
    </SwipeRow>
  );
}
