import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function WeatherPage() {
  const { nameday, weather, news, novinky } = await loadHome();
  return (
    <HomePage
      variant="weather"
      weatherVersion="pocasi-1"
      nameday={nameday}
      weather={weather}
      news={news}
      novinky={novinky}
    />
  );
}
