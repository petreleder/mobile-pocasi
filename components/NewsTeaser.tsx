import type { NewsTeaserInfo } from "@/lib/seznam-news";

export function NewsTeaser({ news }: { news: NewsTeaserInfo }) {
  return (
    <section className="mt-1 px-4 pb-16">
      <div className="relative h-[27px] w-full">
        <div className="flex items-center gap-1 pt-[3px]">
          <img
            src="/assets/favicon-sz.png"
            alt=""
            width={16}
            height={16}
            className="size-4 object-cover"
          />
          <h2 className="text-[14px] leading-5 font-bold text-[#111]">
            Seznam Zprávy
          </h2>
        </div>
        <img
          src="/assets/icon-chevron.svg"
          alt=""
          className="absolute top-[7px] right-[5px]"
        />
        <div className="absolute right-0 bottom-0 left-0 h-px bg-[#ffae01]" />
      </div>
      <a href={news.href} className="flex flex-col text-inherit no-underline">
        <img
          src={news.image}
          alt=""
          width={343}
          height={193}
          className="h-[193px] w-full object-cover"
        />
        <div className="h-1.5" />
        <h3 className="text-[16px] leading-[21px] font-bold text-[#c00]">
          {news.title}
        </h3>
        <p className="mt-0 line-clamp-2 text-[14px] leading-[19px] text-[#666]">
          {news.perex}
        </p>
      </a>
    </section>
  );
}
