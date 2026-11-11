import { seznamAiChatUrl } from "@/lib/seznam-ai";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  const target = query
    ? await seznamAiChatUrl(query)
    : "https://asistent.seznam.cz/";
  return Response.redirect(target, 302);
}
