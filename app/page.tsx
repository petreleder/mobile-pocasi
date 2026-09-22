import { HomePage } from "@/components/HomePage";
import { getNameDay } from "@/lib/nameday";
import { getWeather } from "@/lib/weather";

export const revalidate = 300;

export default async function Home() {
  const [nameday, weather] = await Promise.all([getNameDay(), getWeather()]);
  return <HomePage nameday={nameday} weather={weather} />;
}
