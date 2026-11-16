"use client";

import { useEffect, useRef } from "react";
import { SearchBar } from "./SearchBar";

const stickTop =
  "calc(max(2.5rem, env(safe-area-inset-top, 0px)) - 20px)";

function findScroller(el: HTMLElement): HTMLElement | Window {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") return node;
    node = node.parentElement;
  }
  return window;
}

function readScrollTop(scroller: HTMLElement | Window) {
  return scroller instanceof HTMLElement ? scroller.scrollTop : window.scrollY;
}

export function Header() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const plate = plateRef.current;
    if (!anchor || !plate) return;

    let scroller = findScroller(anchor);
    let frame = 0;

    const apply = () => {
      frame = 0;
      const y = Math.max(0, readScrollTop(scroller));
      const shrink = Math.min(1, y / 24);
      const bar = Math.min(1, y / 12);
      document.documentElement.style.setProperty("--shrink", shrink.toFixed(3));
      document.documentElement.style.setProperty("--bar", bar.toFixed(3));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    const bind = () => {
      scroller = findScroller(anchor);
      const target = scroller === window ? window : scroller;
      target.addEventListener("scroll", onScroll, { passive: true });
      return () => target.removeEventListener("scroll", onScroll);
    };

    let unbind = bind();
    const onResize = () => {
      unbind();
      unbind = bind();
      apply();
    };
    window.addEventListener("resize", onResize);
    apply();

    return () => {
      unbind();
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--shrink");
      document.documentElement.style.removeProperty("--bar");
    };
  }, []);

  return (
    <>
      <div
        ref={plateRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 z-40 bg-white min-[481px]:absolute"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) * -1)",
          height: "env(safe-area-inset-top, 0px)",
          opacity: "var(--bar, 0)",
        }}
      />
      <header
        className="relative z-30 flex h-10 items-center justify-center px-4"
        style={{ marginTop: stickTop }}
      >
        <img
          src="/assets/logo.svg"
          alt="Seznam.cz"
          width={168}
          height={33.6}
          className="h-auto w-[168px]"
        />
      </header>
      <div
        className="sticky z-50 -mt-10 mr-4 ml-auto size-10"
        style={{ top: stickTop }}
      >
        <img src="/assets/avatar.svg" alt="" />
        <span className="absolute inset-0 flex items-center justify-center text-center text-[16px] leading-4 text-[#111]">
          PB
        </span>
      </div>
      <div
        ref={anchorRef}
        className="sticky z-30 mt-5 min-h-[52px] bg-white"
        style={{ top: stickTop }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-b border-solid border-[rgba(0,0,0,0.06)] bg-white"
          style={{
            top: `calc((${stickTop} + env(safe-area-inset-top, 0px)) * -1)`,
            bottom: 0,
            opacity: "var(--bar, 0)",
          }}
        />
        <SearchBar />
      </div>
    </>
  );
}
