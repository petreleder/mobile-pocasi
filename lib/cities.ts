export type City = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  regionId: string;
};

export type Region = {
  id: string;
  name: string;
  cities: City[];
};

type CityDraft = Omit<City, "regionId">;

function region(id: string, name: string, cities: CityDraft[]): Region {
  return {
    id,
    name,
    cities: cities.map((city) => ({ ...city, regionId: id })),
  };
}

export const REGIONS: Region[] = [
  region("praha", "Praha", [
    { id: "praha", name: "Praha", lat: 50.0755, lon: 14.4378 },
  ]),
  region("stredocesky", "Středočeský", [
    { id: "kladno", name: "Kladno", lat: 50.1473, lon: 14.1028 },
    { id: "mlada-boleslav", name: "Mladá Boleslav", lat: 50.4113, lon: 14.9033 },
    { id: "pribram", name: "Příbram", lat: 49.6899, lon: 14.0104 },
    { id: "kolin", name: "Kolín", lat: 50.0281, lon: 15.2012 },
    { id: "kutna-hora", name: "Kutná Hora", lat: 49.9484, lon: 15.2682 },
    { id: "benesov", name: "Benešov", lat: 49.7816, lon: 14.6869 },
    { id: "melnik", name: "Mělník", lat: 50.3505, lon: 14.4741 },
  ]),
  region("jihocesky", "Jihočeský", [
    { id: "ceske-budejovice", name: "České Budějovice", lat: 48.9745, lon: 14.4743 },
    { id: "tabor", name: "Tábor", lat: 49.4144, lon: 14.6578 },
    { id: "pisek", name: "Písek", lat: 49.3089, lon: 14.1475 },
    { id: "jindrichuv-hradec", name: "Jindřichův Hradec", lat: 49.1441, lon: 15.003 },
    { id: "strakonice", name: "Strakonice", lat: 49.2614, lon: 13.9024 },
    { id: "cesky-krumlov", name: "Český Krumlov", lat: 48.811, lon: 14.3152 },
  ]),
  region("plzensky", "Plzeňský", [
    { id: "plzen", name: "Plzeň", lat: 49.7384, lon: 13.3736 },
    { id: "klatovy", name: "Klatovy", lat: 49.3955, lon: 13.2951 },
    { id: "rokycany", name: "Rokycany", lat: 49.7427, lon: 13.5946 },
    { id: "domazlice", name: "Domažlice", lat: 49.4405, lon: 12.9298 },
    { id: "tachov", name: "Tachov", lat: 49.7953, lon: 12.6336 },
  ]),
  region("karlovarsky", "Karlovarský", [
    { id: "karlovy-vary", name: "Karlovy Vary", lat: 50.2319, lon: 12.872 },
    { id: "cheb", name: "Cheb", lat: 50.0796, lon: 12.3739 },
    { id: "sokolov", name: "Sokolov", lat: 50.1814, lon: 12.6401 },
    { id: "marianske-lazne", name: "Mariánské Lázně", lat: 49.9646, lon: 12.7012 },
  ]),
  region("ustecky", "Ústecký", [
    { id: "usti-nad-labem", name: "Ústí nad Labem", lat: 50.6607, lon: 14.0323 },
    { id: "most", name: "Most", lat: 50.503, lon: 13.636 },
    { id: "teplice", name: "Teplice", lat: 50.6404, lon: 13.8245 },
    { id: "decin", name: "Děčín", lat: 50.7822, lon: 14.2148 },
    { id: "chomutov", name: "Chomutov", lat: 50.4605, lon: 13.4178 },
    { id: "litomerice", name: "Litoměřice", lat: 50.5336, lon: 14.1318 },
  ]),
  region("liberecky", "Liberecký", [
    { id: "liberec", name: "Liberec", lat: 50.7663, lon: 15.0543 },
    { id: "jablonec-nad-nisou", name: "Jablonec nad Nisou", lat: 50.7236, lon: 15.1708 },
    { id: "ceska-lipa", name: "Česká Lípa", lat: 50.6855, lon: 14.5376 },
    { id: "turnov", name: "Turnov", lat: 50.5872, lon: 15.1567 },
  ]),
  region("kralovehradecky", "Královéhradecký", [
    { id: "hradec-kralove", name: "Hradec Králové", lat: 50.2104, lon: 15.8252 },
    { id: "trutnov", name: "Trutnov", lat: 50.561, lon: 15.9127 },
    { id: "nachod", name: "Náchod", lat: 50.4167, lon: 16.163 },
    { id: "jicin", name: "Jičín", lat: 50.4372, lon: 15.3516 },
    { id: "dvur-kralove", name: "Dvůr Králové nad Labem", lat: 50.4317, lon: 15.814 },
  ]),
  region("pardubicky", "Pardubický", [
    { id: "pardubice", name: "Pardubice", lat: 50.0343, lon: 15.7812 },
    { id: "chrudim", name: "Chrudim", lat: 49.9511, lon: 15.7956 },
    { id: "svitavy", name: "Svitavy", lat: 49.7559, lon: 16.4683 },
    { id: "usti-nad-orlici", name: "Ústí nad Orlicí", lat: 49.9739, lon: 16.3936 },
    { id: "ceska-trebova", name: "Česká Třebová", lat: 49.9019, lon: 16.4441 },
  ]),
  region("vysocina", "Vysočina", [
    { id: "jihlava", name: "Jihlava", lat: 49.3961, lon: 15.5912 },
    { id: "trebic", name: "Třebíč", lat: 49.2149, lon: 15.8817 },
    { id: "havlickuv-brod", name: "Havlíčkův Brod", lat: 49.6079, lon: 15.5807 },
    { id: "zdar-nad-sazavou", name: "Žďár nad Sázavou", lat: 49.5627, lon: 15.9392 },
    { id: "pelhrimov", name: "Pelhřimov", lat: 49.4313, lon: 15.2234 },
  ]),
  region("jihomoravsky", "Jihomoravský", [
    { id: "brno", name: "Brno", lat: 49.1951, lon: 16.6068 },
    { id: "znojmo", name: "Znojmo", lat: 48.8555, lon: 16.0488 },
    { id: "hodonin", name: "Hodonín", lat: 48.8489, lon: 17.1324 },
    { id: "breclav", name: "Břeclav", lat: 48.759, lon: 16.882 },
    { id: "vyskov", name: "Vyškov", lat: 49.2775, lon: 16.999 },
    { id: "blansko", name: "Blansko", lat: 49.363, lon: 16.6445 },
  ]),
  region("olomoucky", "Olomoucký", [
    { id: "olomouc", name: "Olomouc", lat: 49.5938, lon: 17.2509 },
    { id: "prostejov", name: "Prostějov", lat: 49.4722, lon: 17.1118 },
    { id: "prerov", name: "Přerov", lat: 49.4555, lon: 17.45 },
    { id: "sumperk", name: "Šumperk", lat: 49.9653, lon: 16.9706 },
    { id: "jesenik", name: "Jeseník", lat: 50.2296, lon: 17.2047 },
  ]),
  region("zlinsky", "Zlínský", [
    { id: "zlin", name: "Zlín", lat: 49.2265, lon: 17.6707 },
    { id: "uherske-hradiste", name: "Uherské Hradiště", lat: 49.0698, lon: 17.4597 },
    { id: "vsetin", name: "Vsetín", lat: 49.3387, lon: 17.9962 },
    { id: "kromeriz", name: "Kroměříž", lat: 49.2979, lon: 17.3931 },
    { id: "valasske-mezirici", name: "Valašské Meziříčí", lat: 49.4716, lon: 17.9711 },
  ]),
  region("moravskoslezsky", "Moravskoslezský", [
    { id: "ostrava", name: "Ostrava", lat: 49.8209, lon: 18.2625 },
    { id: "opava", name: "Opava", lat: 49.9387, lon: 17.9026 },
    { id: "frydek-mistek", name: "Frýdek-Místek", lat: 49.6853, lon: 18.348 },
    { id: "karvina", name: "Karviná", lat: 49.854, lon: 18.5417 },
    { id: "havirov", name: "Havířov", lat: 49.7798, lon: 18.4365 },
    { id: "trinec", name: "Třinec", lat: 49.6776, lon: 18.6708 },
    { id: "novy-jicin", name: "Nový Jičín", lat: 49.5944, lon: 18.0103 },
  ]),
];

export const CITIES: City[] = REGIONS.flatMap((item) => item.cities);

export const DEFAULT_CITY =
  CITIES.find((city) => city.id === "brno") ?? CITIES[0];

const CITY_BY_ID = new Map(CITIES.map((city) => [city.id, city]));

export function cityFromId(id: string | null | undefined): City | undefined {
  if (!id) return undefined;
  return CITY_BY_ID.get(id);
}

export function foldText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterRegions(query: string): Region[] {
  const needle = foldText(query);
  if (!needle) return REGIONS;
  return REGIONS.map((item) => ({
    ...item,
    cities: item.cities.filter(
      (city) =>
        foldText(city.name).includes(needle) ||
        foldText(item.name).includes(needle),
    ),
  })).filter((item) => item.cities.length > 0);
}

export function nearestCity(lat: number, lon: number): City {
  let best = DEFAULT_CITY;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const city of CITIES) {
    const distance =
      (city.lat - lat) * (city.lat - lat) + (city.lon - lon) * (city.lon - lon);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = city;
    }
  }
  return best;
}
