import { cityFromId, DEFAULT_CITY } from "@/lib/cities";
import { getWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("city");
  const city = cityFromId(id) ?? DEFAULT_CITY;
  const weather = await getWeather(city);
  return Response.json(weather);
}
