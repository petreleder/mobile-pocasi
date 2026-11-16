"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { ListingFrame, SimilarListing, TopicCard } from "@/lib/seznam-topics";
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

function StoryVideo({ src, active }: { src: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [active]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      loop
      preload={active ? "auto" : "none"}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function StoryPhoto({
  src,
  reverse,
}: {
  src: string;
  reverse?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#000]">
      <img
        src={src}
        alt=""
        className="story-photo absolute inset-x-0 top-0 h-[78%] w-full object-cover [mask-image:linear-gradient(to_bottom,#000_62%,transparent_100%)]"
        style={{ animationDirection: reverse ? "alternate-reverse" : "alternate" }}
      />
    </div>
  );
}

function ListingPhoto({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [pan, setPan] = useState<{ axis: "x" | "y"; seconds: number } | null>(null);

  useEffect(() => {
    const img = ref.current;
    const frame = img?.parentElement;
    if (!img || !frame) return;
    const photo = img;
    const box = frame;

    function measure() {
      if (!photo.naturalWidth || !photo.naturalHeight) return;
      const rect = photo.getBoundingClientRect();
      if (rect.width < 200 || rect.height < 160) {
        setPan(null);
        return;
      }
      const scale = Math.max(
        rect.width / photo.naturalWidth,
        rect.height / photo.naturalHeight,
      );
      const extraX = photo.naturalWidth * scale - rect.width;
      const extraY = photo.naturalHeight * scale - rect.height;
      const extra = Math.max(extraX, extraY);
      if (extra < 12) {
        setPan(null);
        return;
      }
      const next = {
        axis: extraX >= extraY ? ("x" as const) : ("y" as const),
        seconds: Math.min(28, Math.max(10, extra / 40)),
      };
      setPan((current) =>
        current &&
        current.axis === next.axis &&
        Math.abs(current.seconds - next.seconds) < 0.4
          ? current
          : next,
      );
    }

    measure();
    photo.addEventListener("load", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => {
      photo.removeEventListener("load", measure);
      observer.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      className={`absolute inset-x-0 top-0 h-[78%] w-full object-cover [mask-image:linear-gradient(to_bottom,#000_62%,transparent_100%)] ${pan ? "listing-photo" : ""}`}
      data-axis={pan?.axis}
      style={pan ? ({ "--pan": `${pan.seconds.toFixed(1)}s` } as CSSProperties) : undefined}
    />
  );
}

function ListingCaption({
  frame,
  lifted,
}: {
  frame: ListingFrame;
  lifted?: boolean;
}) {
  const accent = useImageAccent(frame.image);
  return (
    <p
      className={`pointer-events-none absolute left-6 right-[76px] text-[20px] leading-[1.35] font-extrabold tracking-[-0.5px] whitespace-pre-line text-white ${lifted ? "bottom-[193px]" : "bottom-[129px]"}`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {frame.text}
      {frame.price ? (
        <>
          {"\n"}
          <span style={{ color: accent.color }}>{frame.price}</span>
        </>
      ) : null}
    </p>
  );
}

function ListingLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-between rounded-full bg-[#666]/80 py-[13px] pr-3 pl-6 text-[14px] leading-[22px] text-white no-underline backdrop-blur-[4px]"
    >
      Celý inzerát na Sreality
      <img
        src="/assets/icon-chevron-right.svg"
        alt=""
        width={24}
        height={24}
      />
    </a>
  );
}

function StoryBar({
  title,
  children,
  onCommentChange,
}: {
  title: string;
  children: ReactNode;
  onCommentChange?: (open: boolean) => void;
}) {
  const initialCounts = usedCounts(title);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialCounts.likes);
  const [comments, setComments] = useState(initialCounts.comments);
  const [commentOpen, setCommentOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function setOpen(open: boolean) {
    setCommentOpen(open);
    onCommentChange?.(open);
  }

  function sendComment() {
    if (!draft.trim()) return;
    setComments((count) => count + 1);
    setDraft("");
    setOpen(false);
  }

  return (
    <>
      <div
        className={`absolute inset-x-0 z-10 flex items-end gap-4 pr-3 pb-6 pl-6 ${commentOpen ? "bottom-16" : "bottom-0"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
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
              className="flex flex-col items-center gap-0.5"
            >
              <img
                src={liked ? "/assets/icon-like-filled.svg" : "/assets/icon-like.svg"}
                alt=""
                width={24}
                height={24}
              />
              <span
                className="text-center text-[12px] leading-4 font-medium text-white [text-shadow:0_0_5px_rgba(0,0,0,0.24)]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {likes}
              </span>
            </button>
            <button
              type="button"
              aria-expanded={commentOpen}
              aria-label="Komentovat"
              onClick={() => setOpen(!commentOpen)}
              className="flex flex-col items-center gap-0.5"
            >
              <img
                src="/assets/icon-comment.svg"
                alt=""
                width={24}
                height={24}
              />
              <span
                className="text-center text-[12px] leading-4 font-medium text-white [text-shadow:0_0_5px_rgba(0,0,0,0.24)]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
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
          className="absolute inset-x-3 bottom-3 z-10 flex gap-2"
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
    </>
  );
}

function SimilarRow({
  item,
  photo,
  priceColor,
}: {
  item: SimilarListing;
  photo: number;
  priceColor: string;
}) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-xl px-1 py-1.5 no-underline"
    >
      <img
        src={item.image}
        alt=""
        width={photo}
        height={photo}
        className="shrink-0 rounded-xl object-cover"
        style={{ width: photo, height: photo }}
      />
      <span
        className="min-w-0 text-[16px] leading-[1.3] font-medium tracking-[-0.5px] whitespace-pre-line text-white"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {item.rooms}
        {"\n"}
        {item.locality}
        {"\n"}
        <span style={{ color: priceColor }}>{item.price}</span>
      </span>
    </a>
  );
}

function SimilarOffers({
  items,
  height,
}: {
  items: SimilarListing[];
  height: number;
}) {
  const photo = height >= 760 ? 96 : 72;
  const accent = useImageAccent("/listings/srbska/hero.jpg");
  return (
    <div className="relative h-full w-full shrink-0 snap-start bg-black">
      <img
        src="/listings/srbska/hero.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
      />
      <div
        className={`relative flex h-full flex-col justify-center px-6 ${photo === 96 ? "pt-16 pb-40" : "pt-14 pb-36"}`}
      >
        <div className="text-center">
          <p
            className="text-[22px] leading-[1.25] font-bold text-white"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Nové inzeráty na Sreality
          </p>
          <p className="mt-1 text-[15px] leading-snug text-white/80">
            Byty na prodej Brno
          </p>
        </div>
        <ul className="mt-2 flex flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <SimilarRow item={item} photo={photo} priceColor={accent.color} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ListingVisual({
  frame,
  lifted,
}: {
  frame: ListingFrame;
  lifted?: boolean;
}) {
  return (
    <>
      <ListingPhoto src={frame.image} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
      />
      <ListingCaption frame={frame} lifted={lifted} />
    </>
  );
}

function ListingShare({ href, title }: { href: string; title: string }) {
  async function share() {
    const payload = { title, url: href };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      // Sharing is unavailable in this browser.
    }
  }

  return (
    <button
      type="button"
      aria-label="Sdílet"
      onClick={share}
      className="flex flex-col items-center gap-0.5 pb-1"
    >
      <img src="/assets/icon-share.svg" alt="" width={24} height={24} />
      <span
        className="text-center text-[12px] leading-4 font-medium text-white [text-shadow:0_0_5px_rgba(0,0,0,0.24)]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        Sdílet
      </span>
    </button>
  );
}

function ListingSlide({
  frames,
  similar,
  height,
  title,
  href,
  active,
}: {
  frames: ListingFrame[];
  similar?: SimilarListing[];
  height: number;
  title: string;
  href: string;
  active?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const pointerX = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const offers = similar && similar.length > 0 ? similar : null;
  const slideCount = frames.length + (offers ? 1 : 0);

  useLayoutEffect(() => {
    dragged.current = false;
    pointerX.current = null;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    setIndex(0);
  }, [active]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth < 1) return;
    if (!dragged.current && el.scrollLeft > 4) {
      el.scrollLeft = 0;
      setIndex(0);
      return;
    }
    const next = Math.min(
      slideCount - 1,
      Math.max(0, Math.round(el.scrollLeft / el.clientWidth)),
    );
    setIndex((current) => (current === next ? current : next));
  }

  return (
    <article
      className="relative w-full shrink-0 snap-start overflow-hidden bg-[#000]"
      style={{ height }}
      aria-label={title}
    >
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onPointerDown={(event) => {
          pointerX.current = event.clientX;
        }}
        onPointerMove={(event) => {
          if (pointerX.current == null) return;
          if (Math.abs(event.clientX - pointerX.current) > 12) dragged.current = true;
        }}
        onPointerUp={() => {
          pointerX.current = null;
        }}
        onPointerCancel={() => {
          pointerX.current = null;
        }}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 4) {
            dragged.current = true;
          }
        }}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [overflow-anchor:none]"
      >
        {frames.map((frame) => (
          <div key={frame.image} className="relative h-full w-full shrink-0 snap-start">
            <ListingVisual frame={frame} />
          </div>
        ))}
        {offers ? <SimilarOffers items={offers} height={height} /> : null}
      </div>
      <div
        className="pointer-events-none absolute bottom-[98px] left-6 right-[76px] z-10 flex justify-center gap-1.5"
      >
        {Array.from({ length: slideCount }, (_, dot) => (
          <span
            key={dot}
            className={`h-1.5 rounded-full ${dot === index ? "w-4 bg-white" : "w-1.5 bg-white/45"}`}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end gap-4 pr-3 pb-6 pl-6">
        <div className="min-w-0 flex-1">
          <ListingLink href={href} />
        </div>
        <ListingShare href={href} title={title} />
      </div>
    </article>
  );
}

function usedCounts(title: string) {
  let hash = 2166136261;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const likes = 24 + (hash >>> 0) % 640;
  const comments = 3 + ((hash >>> 11) % 90);
  return { likes, comments: Math.min(comments, likes) };
}

function TopicSlide({
  topic,
  height,
  reverse,
  active,
}: {
  topic: TopicCard;
  height: number;
  reverse?: boolean;
  active?: boolean;
}) {
  const accent = useImageAccent(topic.image);
  const video = topic.kind === "video" && topic.video ? topic.video : null;
  const tip = topic.kind === "tip";
  const aiHref = `/api/ai?q=${encodeURIComponent(topic.title)}`;

  if (topic.kind === "listing" && topic.frames && topic.frames.length > 0) {
    return (
      <ListingSlide
        frames={topic.frames}
        similar={topic.similar}
        height={height}
        title={topic.title}
        href={topic.href}
        active={active}
      />
    );
  }

  return (
    <article
      className="relative w-full shrink-0 snap-start touch-pan-y overflow-hidden bg-[#000]"
      style={{ height }}
      aria-label={topic.title}
    >
      {video ? (
        <StoryVideo src={video} active={active === true} />
      ) : (
        <StoryPhoto src={topic.image} reverse={reverse} />
      )}
      <div
        aria-hidden
        className={
          video
            ? "pointer-events-none absolute inset-x-0 bottom-0 h-[152px] bg-gradient-to-t from-black to-transparent"
            : "absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
        }
      />
      <StoryBar title={topic.title}>
        {video ? null : tip ? (
          <p
            className="text-[22px] leading-[1.3] font-bold text-white"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {topic.authorImage ? (
              <img
                src={topic.authorImage}
                alt=""
                className="mr-1.5 inline-block size-7 rounded-full object-cover align-[-0.2em]"
              />
            ) : null}
            {topic.kicker ? (
              <span style={{ color: accent.color }}>{topic.kicker} </span>
            ) : null}
            {topic.title}
          </p>
        ) : (
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
        )}
        <a
          href={video || tip ? topic.href : aiHref}
          {...(video || tip
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="flex w-full items-center justify-between rounded-full bg-[#666]/80 py-[13px] pr-3 pl-6 text-[14px] leading-[22px] text-white no-underline backdrop-blur-[4px]"
        >
          {video ? "Přečíst článek" : tip ? "Celý článek" : "Doptat se Seznam AI"}
          <img
            src="/assets/icon-chevron-right.svg"
            alt=""
            width={24}
            height={24}
          />
        </a>
      </StoryBar>
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

  useEffect(() => {
    function swapMeta(name: string, content: string) {
      const current = document.querySelector(`meta[name="${name}"]`);
      const previous = current?.getAttribute("content");
      current?.remove();
      const tag = document.createElement("meta");
      tag.name = name;
      tag.content = content;
      document.head.appendChild(tag);
      return () => {
        tag.remove();
        if (previous == null) return;
        const restore = document.createElement("meta");
        restore.name = name;
        restore.content = previous;
        document.head.appendChild(restore);
      };
    }

    const restoreTheme = swapMeta("theme-color", "#000000");
    return () => {
      restoreTheme();
    };
  }, []);

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
      className={`fixed inset-x-0 bottom-0 z-50 top-[calc(env(safe-area-inset-top,0px)*-1)] min-[481px]:absolute min-[481px]:inset-0 ${grown ? "bg-[#000]" : ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[env(safe-area-inset-top,0px)] bg-[#000] max-[480px]:block"
      />
      <div
        className="absolute overflow-hidden bg-[#000] transition-[top,left,width,height,border-radius] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={frameStyle}
      >
        {feedReady && phase === "open" ? (
          <div
            ref={scrollerRef}
            onScroll={onFeedScroll}
            className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain"
          >
            {feed.map((item, index) => (
              <TopicSlide
                key={item.id}
                topic={item}
                height={slideHeight}
                reverse={index % 2 === 1}
                active={index === activeIndex}
              />
            ))}
          </div>
        ) : (
          <>
            {shown.kind === "listing" && shown.frames?.[0] ? (
              <>
                <StoryPhoto src={shown.frames[0].image} />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
                />
              </>
            ) : shown.kind === "video" && shown.video ? (
              <>
                <video
                  src={shown.video}
                  muted
                  playsInline
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[152px] bg-gradient-to-t from-black to-transparent"
                />
              </>
            ) : (
              <>
                <StoryPhoto src={shown.image} reverse={activeIndex % 2 === 1} />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black from-[13%] to-transparent to-[70%]"
                />
              </>
            )}
          </>
        )}
        <button
          type="button"
          onClick={requestClose}
          aria-label="Zavřít"
          className={`absolute top-[calc(env(safe-area-inset-top,0px)+10px)] right-2 z-20 outline-none transition-opacity duration-200 focus:outline-none focus-visible:outline-none ${grown ? "opacity-100 delay-150" : "pointer-events-none opacity-0"}`}
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
