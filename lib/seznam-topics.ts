export type ListingFrame = {
  image: string;
  text: string;
  price?: string;
};

export type SimilarListing = {
  image: string;
  rooms: string;
  locality: string;
  price: string;
  href: string;
};

export type TopicCard = {
  id: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  kind: "topic" | "video" | "listing" | "tip";
  video?: string;
  frames?: ListingFrame[];
  similar?: SimilarListing[];
  authorImage?: string;
  kicker?: string;
};

const STORY_VIDEOS: TopicCard[] = [
  {
    id: "video-novinky",
    title: "Rozhovor Novinek",
    summary: "",
    image: "/videos/novinky.jpg",
    video: "/videos/novinky.mp4",
    href: "https://www.novinky.cz/",
    kind: "video",
  },
  {
    id: "video-stavka",
    title: "Stávka v České televizi a rozhlase",
    summary: "",
    image: "/videos/stavka.jpg",
    video: "/videos/stavka.mp4",
    href: "https://www.seznamzpravy.cz/clanek/domaci-zivot-v-cesku-v-ceske-televizi-a-ceskem-rozhlase-zacala-jednodenni-stavka-kvuli-financovani-309031",
    kind: "video",
  },
  {
    id: "video-pastrnak",
    title: "Pastrňák řídil výhru Bostonu",
    summary: "",
    image: "/videos/pastrnak.jpg",
    video: "/videos/pastrnak.mp4",
    href: "https://www.sport.cz/clanek/hokej-nhl-pastrnakovo-velke-galapredstaveni-v-nhl-necas-pri-kanonade-nebodoval-5551052",
    kind: "video",
  },
];

const LISTING: TopicCard = {
  id: "listing-srbska",
  title: "Byt 3+kk, 80 m², Srbská, 10,9 mil. Kč",
  summary: "",
  image: "/listings/srbska/hero.jpg",
  href: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno-kralovo-pole-srbska/2634154060",
  kind: "listing",
  frames: [
    {
      image: "/listings/srbska/hero.jpg",
      text: "Prodej bytu 3+kk 80\u00a0m²\nSrbská, Brno - Královo Pole",
      price: "10\u00a0890\u00a0000\u00a0Kč",
    },
    {
      image: "/listings/srbska/obyvak.jpg",
      text: "Obývák s kuchyní\n25\u00a0m², vestavné spotřebiče",
    },
    {
      image: "/listings/srbska/kuchyne.jpg",
      text: "Kuchyně na míru\nTrouba, mikrovlnka a indukce",
    },
    {
      image: "/listings/srbska/pokoj.jpg",
      text: "Pokoj 17\u00a0m²\nDubová podlaha s topením",
    },
    {
      image: "/listings/srbska/koupelna.jpg",
      text: "Koupelna\nVana, sprcha a dubová skříňka",
    },
    {
      image: "/listings/srbska/lodzie.jpg",
      text: "Lodžie ve 3.\u00a0patře\nKrálovo Pole, Slovanské náměstí",
    },
  ],
  similar: [
    {
      image: "/listings/srbska/similar-havlisova.jpg",
      rooms: "3+kk, 75\u00a0m²",
      locality: "Havlišova, Brno - Královo Pole",
      price: "9\u00a0900\u00a0000\u00a0Kč",
      href: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno-kralovo-pole-havlisova/2113478732",
    },
    {
      image: "/listings/srbska/similar-hogrova.jpg",
      rooms: "3+kk, 70\u00a0m²",
      locality: "Högrova, Brno - Královo Pole",
      price: "9\u00a0497\u00a0000\u00a0Kč",
      href: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno-kralovo-pole-hogrova/375861324",
    },
    {
      image: "/listings/srbska/similar-palackeho-93.jpg",
      rooms: "3+kk, 93\u00a0m²",
      locality: "Palackého třída, Brno - Královo Pole",
      price: "11\u00a0990\u00a0000\u00a0Kč",
      href: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno-kralovo-pole-palackeho-trida/2556821580",
    },
    {
      image: "/listings/srbska/similar-purkynova.jpg",
      rooms: "3+kk, 54\u00a0m²",
      locality: "Purkyňova, Brno - Královo Pole",
      price: "7\u00a0499\u00a0000\u00a0Kč",
      href: "https://www.sreality.cz/detail/prodej/byt/3+kk/brno-kralovo-pole-purkynova/1829109836",
    },
  ],
};

function withVideos(topics: TopicCard[]) {
  const merged: TopicCard[] = [];
  let topicIndex = 0;
  for (const video of STORY_VIDEOS) {
    merged.push(video);
    if (topicIndex < topics.length) merged.push(topics[topicIndex++]);
  }
  while (topicIndex < topics.length) merged.push(topics[topicIndex++]);
  merged.splice(Math.min(2, merged.length), 0, LISTING);
  merged.splice(Math.min(3, merged.length), 0, TIP);
  return merged;
}

const TIP: TopicCard = {
  id: "tip-nemy-hokej",
  title: "Rusové rozvracejí dál. Teď se jim to povedlo v\u00a0hokeji",
  summary: "",
  image: "/tips/hokej.jpg",
  href: "https://www.seznamzpravy.cz/clanek/sport-hokej-komentar-rusove-rozvraceji-dal-ted-se-jim-to-povedlo-v-hokeji-319183",
  kind: "tip",
  authorImage: "/tips/nemy.jpg",
  kicker: "Komentář Miroslava Němého:",
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

function articleFromPreview(image: string) {
  const marker = "/thumbnail/v1.0/preview/";
  const at = image.indexOf(marker);
  if (at < 0) return null;
  try {
    const url = decodeURIComponent(image.slice(at + marker.length));
    return url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

async function sharperImage(image: string) {
  const article = articleFromPreview(image);
  if (!article) return image;
  try {
    const response = await fetch(article, {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 300 },
    });
    if (!response.ok) return image;
    const html = await response.text();
    const match =
      html.match(/property="og:image"\s+content="([^"]+)"/) ??
      html.match(/content="([^"]+)"\s+property="og:image"/);
    return match?.[1] || image;
  } catch {
    return image;
  }
}

function sourceBox(url: string) {
  const crop = url.match(/cro,\d+,\d+,(\d+),(\d+)/);
  if (!crop) return null;
  return { width: Number(crop[1]), height: Number(crop[2]) };
}

function imageSize(bytes: Uint8Array) {
  if (bytes.length > 8 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          width: (bytes[offset + 7] << 8) | bytes[offset + 8],
          height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        };
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    return {
      width: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
      height: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23],
    };
  }
  const kind =
    bytes.length > 16
      ? String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
      : "";
  if (
    bytes.length > 30 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  ) {
    if (kind === "VP8X") {
      return {
        width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
        height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
      };
    }
    if (kind === "VP8L") {
      const bits =
        bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    for (let index = 12; index + 7 < bytes.length; index++) {
      if (bytes[index] === 0x9d && bytes[index + 1] === 0x01 && bytes[index + 2] === 0x2a) {
        return {
          width: (bytes[index + 3] | (bytes[index + 4] << 8)) & 0x3fff,
          height: (bytes[index + 5] | (bytes[index + 6] << 8)) & 0x3fff,
        };
      }
    }
  }
  return null;
}

async function photoFacts(url: string) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 300 },
    });
    if (!response.ok || !response.body) return null;
    const declared = Number(response.headers.get("content-length") || 0);
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let got = 0;
    while (got < 65536) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      got += value.byteLength;
    }
    await reader.cancel().catch(() => undefined);
    const merged = new Uint8Array(got);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const size = imageSize(merged);
    return {
      width: size?.width ?? 0,
      height: size?.height ?? 0,
      bytes: declared || got,
    };
  } catch {
    return null;
  }
}

function photoScore(
  url: string,
  facts: { width: number; height: number; bytes: number } | null,
) {
  const source = sourceBox(url);
  const sourceShort = source ? Math.min(source.width, source.height) : 0;
  if (sourceShort >= 1400) return 5;
  if (sourceShort > 0 && sourceShort < 700) return 0;
  if (!facts || facts.width < 1) return sourceShort >= 1000 ? 4 : 1;
  if (facts.width >= 1000 && facts.bytes >= 40000) return 4;
  if (facts.width >= 700 && facts.bytes >= 50000) return 3;
  if (facts.bytes > 0 && facts.bytes < 28000) return 1;
  return sourceShort >= 1000 ? 3 : 2;
}

async function preferSharpPhotos(cards: TopicCard[]) {
  const scored = await Promise.all(
    cards.map(async (card) => {
      const source = sourceBox(card.image);
      const sourceShort = source ? Math.min(source.width, source.height) : 0;
      const facts =
        sourceShort >= 1400 || (sourceShort > 0 && sourceShort < 700)
          ? null
          : await photoFacts(card.image);
      return { card, score: photoScore(card.image, facts) };
    }),
  );
  const sharp = scored.filter((item) => item.score >= 3).map((item) => item.card);
  const soft = scored.filter((item) => item.score < 3).map((item) => item.card);
  return sharp.length > 0 ? [...sharp, ...soft] : cards;
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
    if (!response.ok) return withVideos(FALLBACK_TOPICS);
    const html = await response.text();
    const topics = extractObject(html, "trendingTopics");
    const cards = (topics?.data?.items ?? [])
      .map(toCard)
      .filter((card): card is TopicCard => card !== null)
      .slice(0, CARD_COUNT);
    if (cards.length === 0) return withVideos(FALLBACK_TOPICS);
    const sharpened = await Promise.all(
      cards.map(async (card) => ({
        ...card,
        image: await sharperImage(card.image),
      })),
    );
    return withVideos(await preferSharpPhotos(sharpened));
  } catch {
    return withVideos(FALLBACK_TOPICS);
  }
}
