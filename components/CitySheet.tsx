"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  cityFromId,
  filterRegions,
  nearestCity,
  type City,
} from "@/lib/cities";

export function CitySheet({
  open,
  selectedId,
  busy,
  onClose,
  onSelect,
}: {
  open: boolean;
  selectedId: string;
  busy?: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [geoState, setGeoState] = useState<"idle" | "pending" | "denied">("idle");
  const searchRef = useRef<HTMLInputElement>(null);
  const searching = query.trim().length > 0;
  const regions = useMemo(() => filterRegions(query), [query]);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setGeoState("idle");
    const selected = cityFromId(selectedIdRef.current);
    setExpanded(new Set(selected ? [selected.regionId] : []));
    const timer = window.setTimeout(() => searchRef.current?.focus(), 50);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  function isOpen(regionId: string) {
    if (searching) return true;
    return expanded.has(regionId);
  }

  function toggle(regionId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(regionId)) next.delete(regionId);
      else next.add(regionId);
      return next;
    });
  }

  function locate() {
    if (!navigator.geolocation) {
      setGeoState("denied");
      return;
    }
    setGeoState("pending");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState("idle");
        onSelect(
          nearestCity(position.coords.latitude, position.coords.longitude),
        );
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Zavřít výběr lokality"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-sheet-title"
        className="relative flex max-h-[80vh] w-full max-w-[393px] flex-col rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2
            id="city-sheet-title"
            className="text-[16px] leading-6 font-bold text-[#111]"
          >
            Vyberte lokalitu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center text-[22px] leading-none text-[#666]"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>
        <div className="px-4 pb-2">
          <label className="flex h-11 w-full items-center gap-2 rounded-full border border-solid border-[#aaa] bg-white px-3">
            <img src="/assets/search.svg" alt="" className="size-5 shrink-0" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hledat město"
              className="h-6 min-w-0 flex-1 appearance-none bg-transparent text-[16px] leading-6 text-[#111] outline-none placeholder:text-[#aaa]"
            />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-0.5 p-2.5">
            <button
              type="button"
              onClick={locate}
              disabled={geoState === "pending" || busy}
              className="flex w-full items-center rounded-[6px] py-2 pr-2 pl-3 text-left"
            >
              <span className="min-w-0">
                <span className="block text-[14px] leading-4 font-bold text-[#111]">
                  Aktuální poloha
                </span>
                {geoState !== "idle" ? (
                  <span className="mt-0.5 block text-[12px] leading-4 text-[#666]">
                    {geoState === "pending"
                      ? "Zjišťuji polohu…"
                      : "Polohu se nepodařilo zjistit"}
                  </span>
                ) : null}
              </span>
            </button>
            {regions.length === 0 ? (
              <p className="px-3 py-6 text-[14px] leading-4 text-[#666]">
                Žádné město se nenašlo
              </p>
            ) : (
              regions.map((region) => {
                const openRegion = isOpen(region.id);
                return (
                  <div key={region.id} className="flex w-full flex-col gap-0.5">
                    <button
                      type="button"
                      aria-expanded={openRegion}
                      onClick={() => toggle(region.id)}
                      className={`flex w-full items-center justify-between rounded-[6px] py-2 pr-2 pl-3 text-left ${
                        openRegion ? "bg-black/[0.06]" : ""
                      }`}
                    >
                      <span className="text-[14px] leading-4 font-bold text-[#111]">
                        {region.name}
                      </span>
                      <img
                        src="/assets/ic-arrow-down.svg"
                        alt=""
                        width={17}
                        height={10}
                        className={`shrink-0 transition-transform ${
                          openRegion ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openRegion ? (
                      <div className="flex w-full flex-col gap-0.5 pl-4">
                        {region.cities.map((city) => {
                          const selected = city.id === selectedId;
                          return (
                            <button
                              key={city.id}
                              type="button"
                              disabled={busy}
                              onClick={() => onSelect(city)}
                              className={`flex w-full items-center rounded-[6px] px-2.5 py-2 text-left ${
                                selected ? "bg-black/[0.06]" : ""
                              }`}
                            >
                              <span className="text-[14px] leading-4 text-black">
                                {city.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
