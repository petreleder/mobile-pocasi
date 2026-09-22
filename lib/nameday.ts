export type NameDayInfo = {
  weekday: string;
  dateLabel: string;
  name: string;
};

function capitalizeCs(value: string) {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("cs-CZ") + value.slice(1);
}

function localDateFallback(): NameDayInfo {
  const weekday = capitalizeCs(
    new Intl.DateTimeFormat("cs-CZ", {
      weekday: "long",
      timeZone: "Europe/Prague",
    }).format(new Date()),
  );
  const dateLabel = new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Prague",
  }).format(new Date());

  return { weekday, dateLabel, name: "" };
}

type SvatkyResponse = {
  dayNumber: string;
  dayInWeek: string;
  month: { genitive: string };
  name: string;
};

export async function getNameDay(): Promise<NameDayInfo> {
  try {
    const response = await fetch("https://svatkyapi.cz/api/day", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return localDateFallback();

    const data = (await response.json()) as SvatkyResponse;
    return {
      weekday: capitalizeCs(data.dayInWeek),
      dateLabel: `${Number(data.dayNumber)}.\u00a0${data.month.genitive}`,
      name: data.name,
    };
  } catch {
    return localDateFallback();
  }
}
