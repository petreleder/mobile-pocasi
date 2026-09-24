"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BRNO, windyRadarBackdropUrl } from "@/lib/weather";

const VIEW_W = 222;
const VIEW_H = 122;
const BASE_ZOOM = 9;
const TILE = 256;
const RADAR_ZOOM = 7;
const RADAR_SIZE = 512;
const RADAR_COLOR = 6;
const BRNO_X = 0.8;
const BRNO_Y = 0.46;
const FRAME_MS = 400;
const HOLD_LAST_MS = 1200;
const API_URL = "https://api.rainviewer.com/public/weather-maps.json";

function lon2tile(lon: number, zoom: number) {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function lat2tile(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    2 ** zoom
  );
}

const originX = lon2tile(BRNO.lon, BASE_ZOOM) * TILE - VIEW_W * BRNO_X;
const originY = lat2tile(BRNO.lat, BASE_ZOOM) * TILE - VIEW_H * BRNO_Y;

function basemapTiles() {
  const x0 = Math.floor(originX / TILE);
  const y0 = Math.floor(originY / TILE);
  const x1 = Math.floor((originX + VIEW_W - 1) / TILE);
  const y1 = Math.floor((originY + VIEW_H - 1) / TILE);
  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      tiles.push({
        key: `${tx}-${ty}`,
        src: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${BASE_ZOOM}/${ty}/${tx}`,
        left: tx * TILE - originX,
        top: ty * TILE - originY,
      });
    }
  }
  return tiles;
}

const BASEMAP = basemapTiles();
const radarDisplay = RADAR_SIZE * 2 ** (BASE_ZOOM - RADAR_ZOOM);
const RADAR_STYLE: CSSProperties = {
  width: radarDisplay,
  height: radarDisplay,
  left: lon2tile(BRNO.lon, BASE_ZOOM) * TILE - originX - radarDisplay / 2,
  top: lat2tile(BRNO.lat, BASE_ZOOM) * TILE - originY - radarDisplay / 2,
};

type RadarApi = {
  host: string;
  radar?: {
    past?: { path: string }[];
    nowcast?: { path: string }[];
  };
};

export function WeatherMapBackdrop() {
  const [frames, setFrames] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<RadarApi>;
      })
      .then((data) => {
        if (cancelled) return;
        const list = [
          ...(data.radar?.past ?? []),
          ...(data.radar?.nowcast ?? []),
        ];
        const urls = list.map(
          (frame) =>
            `${data.host}${frame.path}/${RADAR_SIZE}/${RADAR_ZOOM}/${BRNO.lat}/${BRNO.lon}/${RADAR_COLOR}/1_1.png`,
        );
        if (!urls.length) throw new Error("empty");
        setFrames(urls);
        setIndex(urls.length - 1);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (frames.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const last = frames.length - 1;
    const delay = index === last ? HOLD_LAST_MS : FRAME_MS;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [frames, index]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#dce4ec]"
      aria-hidden
    >
      {failed ? (
        <iframe
          title=""
          src={windyRadarBackdropUrl()}
          tabIndex={-1}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute max-w-none border-0"
          style={{
            width: 700,
            height: 450,
            left: -160,
            top: -164,
            transform: "scale(1.75)",
            transformOrigin: "350px 225px",
          }}
        />
      ) : (
        <>
          {BASEMAP.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              className="absolute max-w-none"
              style={{
                width: TILE,
                height: TILE,
                left: tile.left,
                top: tile.top,
              }}
            />
          ))}
          {frames.map((src, frameIndex) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute max-w-none"
              style={{
                ...RADAR_STYLE,
                opacity: frameIndex === index ? 0.88 : 0,
                transition: "opacity 160ms linear",
              }}
            />
          ))}
        </>
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.35) 42%, rgba(0, 0, 0, 0) 72%)",
        }}
      />
    </div>
  );
}
