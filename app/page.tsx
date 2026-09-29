import { HomePage } from "@/components/HomePage";
import { loadHome } from "@/lib/load-home";

export default async function Home() {
  const { nameday, weather } = await loadHome();
  return <HomePage nameday={nameday} weather={weather} />;
}
