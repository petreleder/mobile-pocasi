"use client";

import dynamic from "next/dynamic";

const LottieSvg = dynamic(
  () => import("lottie-react").then((mod) => mod.LottieSvg),
  { ssr: false },
);

export function WeatherAnimIcon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  if (!src.endsWith(".json")) {
    return <img src={src} alt="" draggable={false} className={className} />;
  }

  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <LottieSvg src={src} autoplay loop className="block size-full" />
    </span>
  );
}
