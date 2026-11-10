import type { NewsTeaserInfo } from "@/lib/seznam-news";

export function NewsTeaser({
  news,
  brand,
}: {
  news: NewsTeaserInfo;
  brand: { title: string; favicon: string };
}) {
  return (
    <section>
      <div className="relative h-[27px] w-full">
        <div className="flex items-center gap-1 pt-[3px]">
          <img
            src={brand.favicon}
            alt=""
            width={16}
            height={16}
            className="size-4 object-cover"
          />
          <h2 className="text-[14px] leading-5 font-bold text-[#111]">
            {brand.title}
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
      {news.more.length > 0 ? (
        <>
          <div className="h-[5px]" />
          <div className="flex w-full flex-col gap-[5px]">
            {news.more.map((article) => (
              <a
                key={`${article.href}-${article.title}`}
                href={article.href}
                className="line-clamp-2 w-full text-[14px] leading-[19px] font-normal text-[#c00] no-underline"
              >
                {article.title}
              </a>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
