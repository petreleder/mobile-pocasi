"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const DRAG_PX = 8;

export function WeatherStripToggle({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const origin = useRef<{ scroll: number } | null>(null);

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  function rowScroll(target: EventTarget | null) {
    const root = target as HTMLElement | null;
    return root?.querySelector<HTMLElement>(".overflow-x-auto")?.scrollLeft ?? 0;
  }

  function isExempt(target: EventTarget | null) {
    return Boolean(
      (target as HTMLElement | null)?.closest("button, iframe"),
    );
  }

  return (
    <div
      className="cursor-pointer"
      title="Přepnout verzi počasí"
      onPointerDown={(event) => {
        origin.current = { scroll: rowScroll(event.currentTarget) };
      }}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        if (isExempt(event.target)) return;
        const start = origin.current;
        origin.current = null;
        if (
          start &&
          Math.abs(rowScroll(event.currentTarget) - start.scroll) > DRAG_PX
        ) {
          return;
        }
        router.push(href);
      }}
    >
      {children}
    </div>
  );
}
