import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function Home() {
  const { nameday, weather, news, novinky, topics } = await loadHome();
  return (
    <HomePage
      variant="kratce"
      nameday={nameday}
      weather={weather}
      news={news}
      novinky={novinky}
      topics={topics}
    />
  );
}
