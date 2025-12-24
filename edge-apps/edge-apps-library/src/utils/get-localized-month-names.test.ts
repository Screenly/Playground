import { describe, test, expect } from 'bun:test'
import { getLocalizedMonthNames } from './locale'

describe('getLocalizedMonthNames', () => {
  test('should return full and short month names for en-US locale', () => {
    const result = getLocalizedMonthNames('en-US')
    expect(result).toHaveProperty('full')
    expect(result).toHaveProperty('short')
    expect(result.full).toHaveLength(12)
    expect(result.short).toHaveLength(12)
    expect(result.full).toEqual([
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ])
    expect(result.short).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ])
  })

  test('should return localized longhand month names for different locales', () => {
    const localeExpectations: Array<{
      locale: string
      full: string[]
    }> = [
      {
        locale: 'en-GB',
        full: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
      },
      {
        locale: 'de-DE',
        full: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
      },
      {
        locale: 'ja-JP',
        full: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
      },
      {
        locale: 'fr-FR',
        full: [
          'janvier',
          'février',
          'mars',
          'avril',
          'mai',
          'juin',
          'juillet',
          'août',
          'septembre',
          'octobre',
          'novembre',
          'décembre',
        ],
      },
      {
        locale: 'es-ES',
        full: [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ],
      },
      {
        locale: 'ru-RU',
        full: [
          'январь',
          'февраль',
          'март',
          'апрель',
          'май',
          'июнь',
          'июль',
          'август',
          'сентябрь',
          'октябрь',
          'ноябрь',
          'декабрь',
        ],
      },
    ]

    for (const { locale, full: expectedFull } of localeExpectations) {
      const result = getLocalizedMonthNames(locale)
      expect(result.full).toEqual(expectedFull)
    }
  })

  test('should return full and short month names for different locales', () => {
    const localeExpectations: Array<{
      locale: string
      full: string[]
      short: string[]
    }> = [
      {
        locale: 'en',
        full: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        short: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      {
        locale: 'de',
        full: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
        short: [
          'Jan',
          'Feb',
          'Mär',
          'Apr',
          'Mai',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Okt',
          'Nov',
          'Dez',
        ],
      },
      {
        locale: 'ja',
        full: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
        short: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
      },
      {
        locale: 'fr',
        full: [
          'janvier',
          'février',
          'mars',
          'avril',
          'mai',
          'juin',
          'juillet',
          'août',
          'septembre',
          'octobre',
          'novembre',
          'décembre',
        ],
        short: [
          'janv.',
          'févr.',
          'mars',
          'avr.',
          'mai',
          'juin',
          'juil.',
          'août',
          'sept.',
          'oct.',
          'nov.',
          'déc.',
        ],
      },
      {
        locale: 'es',
        full: [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ],
        short: [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sept',
          'oct',
          'nov',
          'dic',
        ],
      },
      {
        locale: 'ru',
        full: [
          'январь',
          'февраль',
          'март',
          'апрель',
          'май',
          'июнь',
          'июль',
          'август',
          'сентябрь',
          'октябрь',
          'ноябрь',
          'декабрь',
        ],
        short: [
          'янв.',
          'февр.',
          'март',
          'апр.',
          'май',
          'июнь',
          'июль',
          'авг.',
          'сент.',
          'окт.',
          'нояб.',
          'дек.',
        ],
      },
    ]

    for (const {
      locale,
      full: expectedFull,
      short: expectedShort,
    } of localeExpectations) {
      const result = getLocalizedMonthNames(locale)
      expect(result.full).toEqual(expectedFull)
      expect(result.short).toEqual(expectedShort)
    }
  })
})
