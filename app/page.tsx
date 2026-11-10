import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";
import { getTrendingTopics } from "@/lib/seznam-topics";

export default async function Home() {
  const [{ nameday, weather, news, novinky }, topics] = await Promise.all([
    loadHome(),
    getTrendingTopics(),
  ]);
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
