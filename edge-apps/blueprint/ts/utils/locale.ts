/* global screenly */

import tzlookup from '@photostructure/tz-lookup'
import clm from 'country-locale-map'
import { getNearestCity } from 'offline-geocode-city'

export const getTimeZone = (): string => {
  const [latitude, longitude]: [number, number] = screenly.metadata.coordinates
  return tzlookup(latitude, longitude)
}

export async function getLocale(): Promise<string> {
  const [lat, lng] = screenly.metadata.coordinates

  const defaultLocale =
    (navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language) || 'en'

  const data = await getNearestCity(lat, lng)
  const countryCode = data.countryIso2.toUpperCase()

  const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale
  return locale.replace('_', '-')
}
