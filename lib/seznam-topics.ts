export type TopicCard = {
  id: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  kind: "topic" | "video";
};

const HOME = "https://www.seznam.cz/";
const CARD_COUNT = 12;

export const FALLBACK_TOPICS: TopicCard[] = [
  {
    id: "fallback-mak",
    title: "Obří vlčí mák z lidí vytvořil rekord",
    summary:
      "V Kyjově na Hodonínsku padl nový český rekord: 2 178 lidí vytvořilo z červených a černých balónků obří živý vlčí mák, symbol válečných veteránů, a vzdalo jim tak poctu. Rekord bude zapsán v České knize rekordů",
    image: "/assets/article-cover.png",
    href: HOME,
    kind: "topic",
  },
  {
    id: "fallback-media",
    title: "Protesty za média: tisíce v ulicích",
    summary:
      "Tisíce lidí vyšly do ulic na podporu nezávislých médií. Shrnutí tématu se načte z hlavní stránky Seznamu.",
    image: "/assets/article-cover.png",
    href: HOME,
    kind: "topic",
  },
  {
    id: "fallback-pocasi",
    title: "Brno 7 °C, za dvě hodiny bude pršet",
    summary:
      "V Brně bude za dvě hodiny pršet. Aktuální teplota je 7 °C.",
    image: "/assets/article-cover.png",
    href: HOME,
    kind: "topic",
  },
];

type TrendingItem = {
  text?: string;
  summary?: string;
  imageUrl?: string;
  url?: string;
};

function extractObject(source: string, key: string) {
  const token = `"${key}":`;
  const at = source.indexOf(token);
  if (at < 0) return null;
  const start = at + token.length;
  if (source[start] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(source.slice(start, index + 1)) as {
          data?: { items?: TrendingItem[] };
        };
      }
    }
  }
  return null;
}

function toCard(item: TrendingItem, index: number): TopicCard | null {
  const title = item.text?.trim();
  const image = item.imageUrl?.trim();
  if (!title || !image) return null;
  return {
    id: `${index}-${title}`,
    title,
    summary: item.summary?.replace(/<[^>]+>/g, "").trim() ?? "",
    image,
    href: item.url?.trim() || HOME,
    kind: "topic",
  };
}

export async function getTrendingTopics(): Promise<TopicCard[]> {
  try {
    const response = await fetch(HOME, {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) return FALLBACK_TOPICS;
    const html = await response.text();
    const topics = extractObject(html, "trendingTopics");
    const cards = (topics?.data?.items ?? [])
      .map(toCard)
      .filter((card): card is TopicCard => card !== null)
      .slice(0, CARD_COUNT);
    return cards.length > 0 ? cards : FALLBACK_TOPICS;
  } catch {
    return FALLBACK_TOPICS;
  }
}
