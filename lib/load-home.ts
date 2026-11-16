import { getNameDay } from "./nameday";
import { requestedCity } from "./requested-city";
import { getLeadArticle, getNovinkyArticle } from "./seznam-news";
import { getTrendingTopics } from "./seznam-topics";
import { getWeather } from "./weather";

export async function loadHome() {
  const city = await requestedCity();
  const [nameday, weather, news, novinky, topics] = await Promise.all([
    getNameDay(),
    getWeather(city),
    getLeadArticle(),
    getNovinkyArticle(),
    getTrendingTopics(),
  ]);
  return { nameday, weather, news, novinky, topics };
}
