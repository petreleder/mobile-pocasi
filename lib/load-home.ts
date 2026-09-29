import { getNameDay } from "./nameday";
import { requestedCity } from "./requested-city";
import { getWeather } from "./weather";

export async function loadHome() {
  const city = await requestedCity();
  const [nameday, weather] = await Promise.all([
    getNameDay(),
    getWeather(city),
  ]);
  return { nameday, weather };
}
