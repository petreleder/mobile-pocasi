import { SwipeRow } from "./SwipeRow";
import type { CardOrigin } from "./TopicDetail";
import type { TopicCard } from "@/lib/seznam-topics";

export function originFrom(card: HTMLElement): CardOrigin {
  const cardRect = card.getBoundingClientRect();
  const desktop = window.matchMedia("(min-width: 481px)").matches;
  if (!desktop) {
    return {
      top: cardRect.top,
      left: cardRect.left,
      width: cardRect.width,
      height: cardRect.height,
    };
  }
  const frame = document.getElementById("home-screen");
  const frameRect = frame?.getBoundingClientRect();
  const borderTop = frame ? parseFloat(getComputedStyle(frame).borderTopWidth) || 0 : 0;
  const borderLeft = frame ? parseFloat(getComputedStyle(frame).borderLeftWidth) || 0 : 0;
  return {
    top: cardRect.top - (frameRect?.top ?? 0) - borderTop,
    left: cardRect.left - (frameRect?.left ?? 0) - borderLeft,
    width: cardRect.width,
    height: cardRect.height,
  };
}

export function TopicCards({
  topics,
  onOpen,
}: {
  topics: TopicCard[];
  onOpen: (topic: TopicCard, origin: CardOrigin) => void;
}) {
  if (topics.length === 0) return null;

  return (
    <SwipeRow className="mt-2 scroll-pl-4">
      <div className="flex shrink-0 items-start gap-1.5 pr-4 pl-4">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            data-topic-id={topic.id}
            onClick={(event) => onOpen(topic, originFrom(event.currentTarget))}
            className="relative flex h-[156px] w-[88px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-lg px-2 pb-1.5 text-left"
          >
            <img
              src={topic.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black from-0% to-transparent to-[55%]"
            />
            {topic.kind === "video" ? (
              <img
                src="/assets/icon-kratce.svg"
                alt=""
                width={20}
                height={20}
                className="absolute top-2 left-2"
              />
            ) : null}
            <span className="relative line-clamp-4 text-[11px] leading-[1.2] font-bold text-white">
              {topic.title}
            </span>
          </button>
        ))}
      </div>
    </SwipeRow>
  );
}
