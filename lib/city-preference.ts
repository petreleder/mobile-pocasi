export const CITY_COOKIE = "pocasi-city";
export const CITY_STORAGE = "pocasi-city";

export function rememberCity(id: string) {
  try {
    localStorage.setItem(CITY_STORAGE, id);
  } catch {
    // Private mode / blocked storage.
  }
  document.cookie = `${CITY_COOKIE}=${encodeURIComponent(id)};path=/;max-age=31536000;samesite=lax`;
}

export function storedCityId(): string | null {
  try {
    return localStorage.getItem(CITY_STORAGE);
  } catch {
    return null;
  }
}
