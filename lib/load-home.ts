import { getNameDay } from "./nameday";
import { requestedCity } from "./requested-city";
import { getLeadArticle } from "./seznam-news";
import { getWeather } from "./weather";

export async function loadHome() {
  const city = await requestedCity();
  const [nameday, weather, news] = await Promise.all([
    getNameDay(),
    getWeather(city),
    getLeadArticle(),
  ]);
  return { nameday, weather, news };
}
