import tzlookup from "@photostructure/tz-lookup";
import clm from "country-locale-map";
import { getNearestCity } from "offline-geocode-city";

/**
 * Get the timezone for the screen's location
 * Uses the GPS coordinates from Screenly metadata
 */
export function getTimeZone(): string {
  const [latitude, longitude] = screenly.metadata.coordinates;
  return tzlookup(latitude, longitude);
}

/**
 * Get the locale for the screen's location
 * Uses the GPS coordinates to determine the country and returns the appropriate locale
 * Falls back to browser locale if geocoding fails
 */
export async function getLocale(): Promise<string> {
  const [lat, lng] = screenly.metadata.coordinates;

  const defaultLocale =
    (navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language) || "en";

  try {
    const data = await getNearestCity(lat, lng);
    const countryCode = data.countryIso2.toUpperCase();

    const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale;
    return locale.replace("_", "-");
  } catch (error) {
    console.warn(
      "Failed to get locale from coordinates, using default:",
      error,
    );
    return defaultLocale;
  }
}

/**
 * Format coordinates into a human-readable string
 * Example: "37.3861° N, 122.0839° W"
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [latitude, longitude] = coordinates;

  const latString = `${Math.abs(latitude).toFixed(4)}\u00B0`;
  const latDirection = latitude >= 0 ? "N" : "S";
  const lngString = `${Math.abs(longitude).toFixed(4)}\u00B0`;
  const lngDirection = longitude >= 0 ? "E" : "W";

  return `${latString} ${latDirection}, ${lngString} ${lngDirection}`;
}
