"use client";

import { useState } from "react";

function SwapIcon() {
  return (
    <span className="relative size-4 shrink-0">
      <img src="/assets/swap-1.svg" alt="" className="absolute top-1 left-2" />
      <img
        src="/assets/swap-2.svg"
        alt=""
        className="absolute top-[7px] left-[2px]"
      />
    </span>
  );
}

export function SearchBar() {
  const [aiMode, setAiMode] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="mt-5 flex flex-col items-center px-4">
      {aiMode ? (
        <label className="flex h-20 w-[343px] items-start rounded-2xl border border-solid border-[#aaa] bg-white px-5 pt-3.5">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zeptejte se AI"
            rows={2}
            className="h-[52px] w-full resize-none appearance-none bg-transparent text-[16px] leading-6 text-[#111] outline-none placeholder:text-[#aaa]"
          />
        </label>
      ) : (
        <label className="flex h-14 w-[343px] items-center gap-2 rounded-[48px] border border-solid border-[#aaa] bg-white py-4 pr-4 pl-4">
          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden">
            <img src="/assets/search.svg" alt="" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hledej"
            className="h-6 min-w-0 flex-1 appearance-none bg-transparent text-[16px] leading-6 text-[#111] outline-none placeholder:text-[#aaa]"
          />
        </label>
      )}
      <button
        type="button"
        className="mt-2 flex items-center justify-center gap-1.5"
        onClick={() => setAiMode((value) => !value)}
        aria-pressed={aiMode}
      >
        <SwapIcon />
        <span className="text-[12px] leading-4 whitespace-nowrap text-[#c00]">
          {aiMode ? "Přepnout na hledání" : "Přepnout na AI"}
        </span>
      </button>
    </div>
  );
}
