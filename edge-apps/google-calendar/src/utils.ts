/* global FileReader, screenly */

import tzlookup from '@photostructure/tz-lookup'
import clm from 'country-locale-map'
import { getNearestCity } from 'offline-geocode-city'
import * as Sentry from '@sentry/vue'

import { GOOGLE_OAUTH_TOKEN_URL } from '@/constants'
import type { CalendarDay } from '@/constants'

export const getTimeZone = (): string => {
  const [latitude, longitude] = screenly.metadata.coordinates
  return tzlookup(latitude, longitude)
}

export async function getLocale(): Promise<string> {
  const [lat, lng] = screenly.metadata.coordinates

  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0].replace('_', '-')
    : navigator.language.replace('_', '-')

  const data = await getNearestCity(lat, lng)
  const countryCode = data.countryIso2.toUpperCase()

  const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale
  return locale.replace('_', '-')
}

export const getFormattedTime = async (
  date: Date = new Date(),
  locale: string | null = null,
): Promise<string> => {
  const resolvedLocale = locale || (await getLocale())
  const intlLocale = new Intl.Locale(resolvedLocale)
  let hourFormat: 'numeric' | '2-digit' = 'numeric'

  if (intlLocale.hourCycle) {
    if (intlLocale.hourCycle === 'h12') {
      hourFormat = 'numeric'
    } else {
      hourFormat = '2-digit'
    }
  }

  return date.toLocaleTimeString(resolvedLocale, {
    hour: hourFormat,
    minute: '2-digit',
    timeZone: getTimeZone(),
  })
}

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay()
}

export const generateCalendarDays = (
  year: number,
  month: number,
): CalendarDay[] => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)
  const days: CalendarDay[] = []

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    })
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
    })
  }

  // Calculate remaining days needed to complete the last row
  const totalDaysSoFar = days.length
  const remainingDaysInLastRow = 7 - (totalDaysSoFar % 7)
  const needsExtraRow = remainingDaysInLastRow < 7

  // Add next month's days only for the last row if needed
  for (let i = 1; i <= (needsExtraRow ? remainingDaysInLastRow : 0); i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
    })
  }

  return days
}

const fetchImage = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from ${fileUrl}, status: ${response.status}`,
      )
    }

    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const uintArray = new Uint8Array(buffer)

    // Get the first 4 bytes for magic number detection
    const hex = Array.from(uintArray.slice(0, 4))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()

    // Convert the first few bytes to ASCII for text-based formats like SVG
    const ascii = String.fromCharCode.apply(
      null,
      Array.from(uintArray.slice(0, 100)),
    )

    if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
      return new Promise((resolve) => {
        const svgReader = new FileReader()
        svgReader.readAsText(blob)
        svgReader.onloadend = () => {
          const base64 = btoa(
            unescape(encodeURIComponent(svgReader.result as string)),
          )
          resolve('data:image/svg+xml;base64,' + base64)
        }
      })
    } else if (hex === '89504E47' || hex.startsWith('FFD8FF')) {
      return fileUrl
    } else {
      throw new Error('Unknown image type')
    }
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

export const initializeGlobalBrandingSettings = async (): Promise<void> => {
  // constant colors
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'
  const defaultPrimaryColor = '#7E2CD2'
  let secondaryColor = '#454BD2'

  const theme = screenly.settings.theme ? screenly.settings.theme : 'light'
  const primaryColor =
    !screenly.settings.screenly_color_accent ||
    screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff'
      ? defaultPrimaryColor
      : screenly.settings.screenly_color_accent

  if (theme === 'light') {
    secondaryColor =
      !screenly.settings.screenly_color_light ||
      screenly.settings.screenly_color_light.toLowerCase() === '#ffffff'
        ? '#adafbe'
        : screenly.settings.screenly_color_light
  } else if (theme === 'dark') {
    secondaryColor =
      !screenly.settings.screenly_color_dark ||
      screenly.settings.screenly_color_dark.toLowerCase() === '#ffffff'
        ? '#adafbe'
        : screenly.settings.screenly_color_dark
  }

  document.documentElement.style.setProperty(
    '--theme-color-primary',
    primaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-secondary',
    secondaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-tertiary',
    tertiaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-background',
    backgroundColor,
  )

  // Get the logo image element
  const imgElement = document.getElementById('brand-logo') as HTMLImageElement

  // Check if the element exists
  if (!imgElement) {
    console.warn('Brand logo element not found in the DOM')
    return
  }

  // Initialize variables
  let logoUrl = '' // Logo URL
  let fallbackUrl = '' // Fallback logo if CORS URL fails
  const defaultLogo = 'img/screenly.svg' // Fall back screenly logo

  // Define settings
  const lightLogo = screenly.settings.screenly_logo_light
  const darkLogo = screenly.settings.screenly_logo_dark

  // Set logo URLs based on theme
  if (theme === 'light') {
    logoUrl = lightLogo
      ? `${screenly.cors_proxy_url}/${lightLogo}`
      : `${screenly.cors_proxy_url}/${darkLogo || ''}`
    fallbackUrl = lightLogo || darkLogo || ''
  } else if (theme === 'dark') {
    logoUrl = darkLogo
      ? `${screenly.cors_proxy_url}/${darkLogo}`
      : `${screenly.cors_proxy_url}/${lightLogo || ''}`
    fallbackUrl = darkLogo || lightLogo || ''
  }

  // First, try to fetch the image using the CORS proxy URL
  try {
    const imageUrl = await fetchImage(logoUrl)
    imgElement.src = imageUrl
  } catch (error) {
    // If CORS fails, try the fallback URL
    try {
      const fallbackImageUrl = await fetchImage(fallbackUrl)
      imgElement.src = fallbackImageUrl
    } catch (fallbackError) {
      // If fallback fails, use the default logo
      imgElement.src = defaultLogo
    }
  }
}

export const getFormattedMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long' })
}

export const getYear = (date: Date): number => date.getFullYear()
export const getMonth = (date: Date): number => date.getMonth()
export const getDate = (date: Date): number => date.getDate()

export const getFormattedDayOfWeek = (date: Date, locale = 'en-US'): string => {
  return date.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase()
}

export const getAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<string> => {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json()

  return data.access_token
}

export const initializeSentrySettings = (): void => {
  const sentryDsn = screenly.settings.sentry_dsn

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn as string,
    })
  } else {
    console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
  }
}
