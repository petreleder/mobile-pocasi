import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function WeatherPage() {
  const { nameday, weather } = await loadHome();
  return <HomePage variant="weather" nameday={nameday} weather={weather} />;
}
