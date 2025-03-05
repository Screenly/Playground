import tzlookup from '@photostructure/tz-lookup';
import clm from 'country-locale-map';
import { getNearestCity } from 'offline-geocode-city';

const getTimeZone = () => {
  const [latitude, longitude] = window.screenly.metadata.coordinates;
  return tzlookup(latitude, longitude);
};

export async function getLocale() {
  const [lat, lng] = window.screenly.metadata.coordinates;

  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0].replace('_', '-')
    : navigator.language.replace('_', '-');

  const data = await getNearestCity(lat, lng);
  const countryCode = data.countryIso2.toUpperCase();

  const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale;
  return locale.replace('_', '-');
}

export const getFormattedTime = async (date = new Date()) => {
  return date.toLocaleTimeString(
    await getLocale(),
    {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: getTimeZone()
    }
  );
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const generateCalendarDays = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const days = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true
    });
  }

  // Calculate remaining days needed to complete the last row
  const totalDaysSoFar = days.length;
  const remainingDaysInLastRow = 7 - (totalDaysSoFar % 7);
  const needsExtraRow = remainingDaysInLastRow < 7;

  // Add next month's days only for the last row if needed
  for (let i = 1; i <= (needsExtraRow ? remainingDaysInLastRow : 0); i++) {
    days.push({
      day: i,
      isCurrentMonth: false
    });
  }

  return days;
};

export const initializeThemeColors = () => {
  const {
    theme_primary_color: themePrimaryColor,
    theme_secondary_color: themeSecondaryColor,
    theme_tertiary_color: themeTertiaryColor,
    theme_background_color: themeBackgroundColor,
    theme_accent_color: themeAccentColor,
    theme_text_color: themeTextColor
  } = window.screenly.settings;

  // Only override CSS variables if theme colors are provided in settings
  if (themePrimaryColor) {
    document.documentElement.style.setProperty('--theme-color-primary', themePrimaryColor);
  }
  if (themeSecondaryColor) {
    document.documentElement.style.setProperty('--theme-color-secondary', themeSecondaryColor);
  }
  if (themeTertiaryColor) {
    document.documentElement.style.setProperty('--theme-color-tertiary', themeTertiaryColor);
  }
  if (themeBackgroundColor) {
    document.documentElement.style.setProperty('--theme-color-background', themeBackgroundColor);
  }
  if (themeAccentColor) {
    document.documentElement.style.setProperty('--theme-color-accent', themeAccentColor);
  }
  if (themeTextColor) {
    document.documentElement.style.setProperty('--theme-color-text', themeTextColor);
  }
};

export const getFormattedMonthName = (date) => {
  return date.toLocaleString('default', { month: 'long' });
};

export const getYear = (date) => date.getFullYear();
export const getMonth = (date) => date.getMonth();
export const getDate = (date) => date.getDate();
