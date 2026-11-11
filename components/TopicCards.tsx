import { SwipeRow } from "./SwipeRow";
import type { TopicCard } from "@/lib/seznam-topics";

export function TopicCards({ topics }: { topics: TopicCard[] }) {
  if (topics.length === 0) return null;

  return (
    <SwipeRow className="mt-2 scroll-pl-4">
      <div className="flex shrink-0 items-start gap-1.5 pr-4 pl-4">
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={topic.href}
            className="relative flex h-[156px] w-[88px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-lg px-2 pb-1.5 no-underline"
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
          </a>
        ))}
      </div>
    </SwipeRow>
  );
}
