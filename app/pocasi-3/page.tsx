import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function WeatherV3Page() {
  const { nameday, weather, news } = await loadHome();
  return (
    <HomePage
      variant="weather"
      weatherVersion="pocasi-3"
      nameday={nameday}
      weather={weather}
      news={news}
    />
  );
}
