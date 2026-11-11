const CHAT = "https://asistent.seznam.cz/";

export async function seznamAiChatUrl(query: string): Promise<string> {
  try {
    const response = await fetch(
      `https://search.seznam.cz/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "text/html",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return CHAT;
    const html = await response.text();
    const marker = "https://asistent.seznam.cz/?q=";
    const at = html.indexOf(marker);
    if (at < 0) return CHAT;
    const stops = ["&quot;", '"', "'", "<", " ", "\\"].map((token) => {
      const index = html.indexOf(token, at);
      return index < 0 ? html.length : index;
    });
    const url = html
      .slice(at, Math.min(...stops))
      .replaceAll("&amp;", "&")
      .replaceAll("\\u0026", "&");
    return url.includes("sign=") ? url : CHAT;
  } catch {
    return CHAT;
  }
}
