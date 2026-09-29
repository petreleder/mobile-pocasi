import { cookies } from "next/headers";
import { cityFromId, DEFAULT_CITY, type City } from "./cities";
import { CITY_COOKIE } from "./city-preference";

export async function requestedCity(): Promise<City> {
  const jar = await cookies();
  return cityFromId(jar.get(CITY_COOKIE)?.value) ?? DEFAULT_CITY;
}
