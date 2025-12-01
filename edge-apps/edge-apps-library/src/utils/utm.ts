/**
 * UTM parameters for tracking
 */
export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_location: string;
  utm_placement: string;
  [key: string]: string;
}

/**
 * Get default UTM parameters from Screenly metadata
 */
export function getDefaultUTMParams(): UTMParams {
  const { location, hostname } = screenly.metadata;

  return {
    utm_source: "screenly",
    utm_medium: "digital-signage",
    utm_location: encodeURIComponent(location),
    utm_placement: encodeURIComponent(hostname),
  };
}

/**
 * Add UTM parameters to a URL
 */
export function addUTMParams(url: string, params?: Partial<UTMParams>): string {
  const utmParams = { ...getDefaultUTMParams(), ...params };

  const queryString = Object.entries(utmParams)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join("&");

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${queryString}`;
}

/**
 * Conditionally add UTM parameters to a URL
 */
export function addUTMParamsIf(
  url: string,
  enabled: boolean,
  params?: Partial<UTMParams>,
): string {
  return enabled ? addUTMParams(url, params) : url;
}
