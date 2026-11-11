import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function EmailPage() {
  const { nameday, weather, news, novinky } = await loadHome();
  return (
    <HomePage
      variant="email"
      nameday={nameday}
      weather={weather}
      news={news}
      novinky={novinky}
    />
  );
}
