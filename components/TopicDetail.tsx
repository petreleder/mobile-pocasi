"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TopicCard } from "@/lib/seznam-topics";
import { titleHighlight } from "@/lib/title-highlight";
import { originFrom } from "./TopicCards";
import { useImageAccent } from "./use-image-accent";

function SummaryText({
  title,
  summary,
  color,
}: {
  title: string;
  summary: string;
  color: string;
}) {
  const text = summary.trim();
  if (!text) return <span style={{ color }}>{title}</span>;
  const span = titleHighlight(title, text);
  if (!span) return text;
  return (
    <>
      {text.slice(0, span.start)}
      <span style={{ color }}>{text.slice(span.start, span.end)}</span>
      {text.slice(span.end)}
    </>
  );
}

function TopicSlide({ topic, height }: { topic: TopicCard; height: number }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const accent = useImageAccent(topic.image);
  const aiHref = `/api/ai?q=${encodeURIComponent(topic.title)}`;

  function sendComment() {
    if (!draft.trim()) return;
    setComments((count) => count + 1);
    setDraft("");
    setCommentOpen(false);
  }

  return (
    <article
      className="relative w-full shrink-0 snap-start"
      style={{ height }}
      aria-label={topic.title}
    >
      <img
        src={topic.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
      />
      <div
        className={`absolute inset-x-0 flex items-end gap-4 pr-3 pb-6 pl-6 ${commentOpen ? "bottom-16" : "bottom-0"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] leading-[18px] text-white">
              Seznam AI<span className="text-[#c00]">.</span>
            </p>
            <p
              className="text-[16px] leading-[1.3] font-bold text-white"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <SummaryText
                title={topic.title}
                summary={topic.summary}
                color={accent.color}
              />
            </p>
          </div>
          <a
            href={aiHref}
            className="flex w-full items-center justify-between rounded-lg bg-[#666]/80 py-[13px] pr-3 pl-5 text-[14px] leading-[22px] text-white no-underline backdrop-blur-[4px]"
          >
            Doptat se Seznam AI
            <img
              src="/assets/icon-chevron-right.svg"
              alt=""
              width={24}
              height={24}
            />
          </a>
        </div>
        <div className="flex flex-col items-center gap-[18px] pb-1">
          <div className="flex flex-col items-center gap-6">
            <button
              type="button"
              aria-pressed={liked}
              aria-label={liked ? "Odebrat označení To se mi líbí" : "To se mi líbí"}
              onClick={() => {
                setLiked((value) => !value);
                setLikes((count) => (liked ? count - 1 : count + 1));
              }}
              className="flex flex-col items-center drop-shadow-[0px_0px_1.5px_rgba(0,0,0,0.4)]"
            >
              <img
                src={liked ? "/assets/icon-like-filled.svg" : "/assets/icon-like.svg"}
                alt=""
                width={32}
                height={32}
              />
              <span className="text-[12px] leading-4 font-bold text-white">
                {likes}
              </span>
            </button>
            <button
              type="button"
              aria-expanded={commentOpen}
              aria-label="Komentovat"
              onClick={() => setCommentOpen((open) => !open)}
              className="flex flex-col items-center gap-1 drop-shadow-[0px_0px_1.5px_rgba(0,0,0,0.4)]"
            >
              <img
                src="/assets/icon-comment.svg"
                alt=""
                width={24}
                height={24}
              />
              <span className="text-[12px] leading-4 font-bold text-white">
                {comments}
              </span>
            </button>
          </div>
          <button type="button" aria-label="Další" className="px-3">
            <img src="/assets/icon-more.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>
      {commentOpen ? (
        <form
          className="absolute inset-x-3 bottom-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            sendComment();
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Napište komentář"
            aria-label="Komentář"
            className="h-11 min-w-0 flex-1 rounded-lg border-0 bg-[#666]/80 px-4 text-[14px] text-white backdrop-blur-[4px] outline-none placeholder:text-white/70"
          />
          <button
            type="submit"
            className="h-11 rounded-lg bg-white px-4 text-[14px] font-bold text-[#111]"
          >
            Odeslat
          </button>
        </form>
      ) : null}
    </article>
  );
}

export type CardOrigin = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function TopicDetail({
  topics,
  topic,
  origin,
  onClose,
}: {
  topics: TopicCard[];
  topic: TopicCard;
  origin: CardOrigin | null;
  onClose: () => void;
}) {
  const feed = topics.length > 0 ? topics : [topic];
  const startIndex = Math.max(
    0,
    feed.findIndex((item) => item.id === topic.id),
  );
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [phase, setPhase] = useState<"from" | "open" | "closing">(
    origin ? "from" : "open",
  );
  const [exitOrigin, setExitOrigin] = useState(origin);
  const [feedReady, setFeedReady] = useState(false);
  const [slideHeight, setSlideHeight] = useState(0);
  const grown = phase === "open";
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const [fullSize, setFullSize] = useState({ width: 0, height: 0 });
  const shown = feed[activeIndex] ?? topic;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      setFullSize({ width: rect.width, height: rect.height });
    }
    if (phase !== "from") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !origin) {
      setPhase("open");
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase("open"));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [origin, phase]);

  useEffect(() => {
    if (phase !== "open") return;
    const timer = window.setTimeout(() => setFeedReady(true), 480);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useLayoutEffect(() => {
    if (!feedReady) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const height = scroller.clientHeight;
    if (height > 0 && height !== slideHeight) setSlideHeight(height);
  }, [feedReady, fullSize.height, slideHeight]);

  useLayoutEffect(() => {
    if (!feedReady || !slideHeight || positioned.current) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = startIndex * slideHeight;
    positioned.current = true;
  }, [feedReady, slideHeight, startIndex]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timer = window.setTimeout(onClose, 480);
    return () => window.clearTimeout(timer);
  }, [onClose, phase]);

  function requestClose() {
    const card = document.querySelector(
      `[data-topic-id="${CSS.escape(shown.id)}"]`,
    );
    if (card instanceof HTMLElement) setExitOrigin(originFrom(card));
    setFeedReady(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !origin) {
      onClose();
      return;
    }
    setPhase("closing");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, origin, phase, shown.id]);

  function onFeedScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || !slideHeight || !positioned.current) return;
    const index = Math.round(scroller.scrollTop / slideHeight);
    const next = Math.min(feed.length - 1, Math.max(0, index));
    setActiveIndex((current) => (current === next ? current : next));
  }

  const motionOrigin = phase === "closing" ? exitOrigin : origin;
  const frameStyle =
    grown || !motionOrigin
      ? {
          top: 0,
          left: 0,
          width: fullSize.width || "100%",
          height: fullSize.height || "100%",
          borderRadius: 0,
        }
      : {
          top: motionOrigin.top,
          left: motionOrigin.left,
          width: motionOrigin.width,
          height: motionOrigin.height,
          borderRadius: 8,
        };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={shown.title}
      ref={sectionRef}
      className="fixed inset-0 z-50 min-[481px]:absolute"
    >
      <div
        className="absolute overflow-hidden transition-[top,left,width,height,border-radius] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={frameStyle}
      >
        {feedReady && phase === "open" ? (
          <div
            ref={scrollerRef}
            onScroll={onFeedScroll}
            className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
          >
            {feed.map((item) => (
              <TopicSlide key={item.id} topic={item} height={slideHeight} />
            ))}
          </div>
        ) : (
          <>
            <img
              src={shown.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
            />
          </>
        )}
        <button
          type="button"
          onClick={requestClose}
          aria-label="Zavřít"
          autoFocus
          className={`absolute top-[10px] right-2 z-10 transition-opacity duration-200 ${grown ? "opacity-100 delay-150" : "pointer-events-none opacity-0"}`}
        >
          <img
            src="/assets/icon-close-story.svg"
            alt=""
            width={48}
            height={48}
          />
        </button>
      </div>
    </section>
  );
}
