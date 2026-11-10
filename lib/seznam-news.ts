export type NewsHeadline = {
  title: string;
  href: string;
};

export type NewsTeaserInfo = {
  title: string;
  perex: string;
  image: string;
  href: string;
  more: NewsHeadline[];
};

const RSS_SEZNAM = "https://www.seznamzpravy.cz/rss/hp";
const RSS_NOVINKY = "https://www.novinky.cz/rss";
const MORE_COUNT = 3;

export const FALLBACK_MORE: NewsHeadline[] = [
  {
    title: "Turistická atrakce, která vytáčí Pražany, se vrací do centra",
    href: "https://www.seznamzpravy.cz",
  },
  {
    title:
      "Mozaika oblohy od soumraku do úsvitu. Ty nejkrásnější snímky Perseid",
    href: "https://www.seznamzpravy.cz",
  },
  {
    title:
      "Testy do Řecka nerušte. Je to jen Babišův tweet. varuje ministerstvo",
    href: "https://www.seznamzpravy.cz",
  },
];

export const FALLBACK_NEWS: NewsTeaserInfo = {
  title: "Je tu prudké zdražování. Důvod? Češi málo utrácejí",
  perex:
    "Klobásy a alkohol. Dvě položky, jejichž ceny vzrostly nejvíc. Zdražila ale i leektřina a další náklady na...",
  image: "/assets/article-cover.png",
  href: "https://www.seznamzpravy.cz",
  more: FALLBACK_MORE,
};

export const FALLBACK_NOVINKY: NewsTeaserInfo = {
  title:
    "Policejní tým Tempus dál kope v domě sedm let pohřešované ženy z Lounska",
  perex:
    "Tým kriminalistů z policejního prezidia Tempus, který má na starost léta nevyřešené případy, i ve čtvrtek...",
  image: "/assets/article-cover.png",
  href: "https://www.novinky.cz",
  more: [
    {
      title: "ON-LINE: Nově nakažených koronavirem v Česku razantně přibývá",
      href: "https://www.novinky.cz",
    },
    {
      title: "Kraj přidá na opravy zámků, miliony dostanou i Roden a Stropnický",
      href: "https://www.novinky.cz",
    },
    {
      title:
        "Monika Babišová opět zastínila svůj politický protějšek,tentokrát Susan Pompeovou",
      href: "https://www.novinky.cz",
    },
  ],
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
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

async function fetchFeed(
  url: string,
  fallback: NewsTeaserInfo,
): Promise<NewsTeaserInfo> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 300 },
    });
    if (!response.ok) return fallback;
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(
      (match) => match[1],
    );
    const parsed = items
      .map((item) => ({
        title: tag(item, "title"),
        perex: tag(item, "description"),
        href: tag(item, "link"),
        image: tag(item, "szn:url"),
      }))
      .filter((item) => item.title);
    const lead = parsed[0];
    if (!lead?.perex) return fallback;
    return {
      title: lead.title,
      perex: lead.perex,
      image: lead.image || fallback.image,
      href: lead.href || fallback.href,
      more: parsed.slice(1, 1 + MORE_COUNT).map((item) => ({
        title: item.title,
        href: item.href || fallback.href,
      })),
    };
  } catch {
    return fallback;
  }
}

export function getLeadArticle() {
  return fetchFeed(RSS_SEZNAM, FALLBACK_NEWS);
}

export function getNovinkyArticle() {
  return fetchFeed(RSS_NOVINKY, FALLBACK_NOVINKY);
}
