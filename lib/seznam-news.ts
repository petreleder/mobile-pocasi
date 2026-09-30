export type NewsTeaserInfo = {
  title: string;
  perex: string;
  image: string;
  href: string;
};

const RSS_HP = "https://www.seznamzpravy.cz/rss/hp";

export const FALLBACK_NEWS: NewsTeaserInfo = {
  title: "Je tu prudké zdražování. Důvod? Češi málo utrácejí",
  perex:
    "Klobásy a alkohol. Dvě položky, jejichž ceny vzrostly nejvíc. Zdražila ale i leektřina a další náklady na...",
  image: "/assets/article-cover.png",
  href: "https://www.seznamzpravy.cz",
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code)),
    )
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

export async function getLeadArticle(): Promise<NewsTeaserInfo> {
  try {
    const response = await fetch(RSS_HP, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 300 },
    });
    if (!response.ok) return FALLBACK_NEWS;
    const xml = await response.text();
    const item = xml.match(/<item>([\s\S]*?)<\/item>/i)?.[1];
    if (!item) return FALLBACK_NEWS;
    const title = tag(item, "title");
    const perex = tag(item, "description");
    const href = tag(item, "link");
    const image = tag(item, "szn:url");
    if (!title || !perex) return FALLBACK_NEWS;
    return {
      title,
      perex,
      image: image || FALLBACK_NEWS.image,
      href: href || FALLBACK_NEWS.href,
    };
  } catch {
    return FALLBACK_NEWS;
  }
}
