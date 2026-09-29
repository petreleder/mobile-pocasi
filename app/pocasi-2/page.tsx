import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function WeatherV2Page() {
  const { nameday, weather } = await loadHome();
  return (
    <HomePage
      variant="weather"
      weatherVersion="pocasi-2"
      nameday={nameday}
      weather={weather}
    />
  );
}
