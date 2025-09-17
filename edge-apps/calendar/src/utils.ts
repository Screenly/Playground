/* global screenly */

import tzlookup from '@photostructure/tz-lookup'
import clm from 'country-locale-map'
import { getNearestCity } from 'offline-geocode-city'
import * as Sentry from '@sentry/vue'

import type { CalendarDay } from '@/constants'

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

export const getFormattedTime = async (
  date: Date = new Date(),
  locale: string | null = null,
  timezone?: string,
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
    timeZone: timezone || 'UTC',
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

export const getFormattedMonthName = (date: Date, locale = 'en-US'): string => {
  return date.toLocaleDateString(locale, { month: 'long' })
}

export const getYear = (date: Date): number => date.getFullYear()
export const getMonth = (date: Date): number => date.getMonth()
export const getDate = (date: Date): number => date.getDate()

export const getFormattedDayOfWeek = (date: Date, locale = 'en-US'): string => {
  return date.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase()
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
