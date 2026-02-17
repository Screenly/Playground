import { describe, test, expect } from 'bun:test'
import { getLocalizedDayNames } from './locale'

// eslint-disable-next-line max-lines-per-function
describe('getLocalizedDayNames', () => {
  test('should return full and short day names for en-US locale', () => {
    const result = getLocalizedDayNames('en-US')
    expect(result).toHaveProperty('full')
    expect(result).toHaveProperty('short')
    expect(result.full).toHaveLength(7)
    expect(result.short).toHaveLength(7)
    expect(result.full).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ])
    expect(result.short).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])
  })

  // Parametrized tests for full day names across locales
  const localeExpectations: Array<{
    locale: string
    full: string[]
  }> = [
    {
      locale: 'en-GB',
      full: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
    },
    {
      locale: 'de-DE',
      full: [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
      ],
    },
    {
      locale: 'ja-JP',
      full: [
        '日曜日',
        '月曜日',
        '火曜日',
        '水曜日',
        '木曜日',
        '金曜日',
        '土曜日',
      ],
    },
    {
      locale: 'fr-FR',
      full: [
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
      ],
    },
    {
      locale: 'es-ES',
      full: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
    },
    {
      locale: 'ru-RU',
      full: [
        'воскресенье',
        'понедельник',
        'вторник',
        'среда',
        'четверг',
        'пятница',
        'суббота',
      ],
    },
  ]

  for (const { locale, full: expectedFull } of localeExpectations) {
    test(`should return full day names for ${locale}`, () => {
      const result = getLocalizedDayNames(locale)
      expect(result.full).toEqual(expectedFull)
    })
  }

  // Parametrized tests for full and short day names across locales
  const localeShortExpectations: Array<{
    locale: string
    full: string[]
    short: string[]
  }> = [
    {
      locale: 'en',
      full: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
      locale: 'de',
      full: [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
      ],
      short: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    },
    {
      locale: 'ja',
      full: [
        '日曜日',
        '月曜日',
        '火曜日',
        '水曜日',
        '木曜日',
        '金曜日',
        '土曜日',
      ],
      short: ['日', '月', '火', '水', '木', '金', '土'],
    },
    {
      locale: 'fr',
      full: [
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
      ],
      short: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    },
    {
      locale: 'es',
      full: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      short: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    },
  ]

  for (const {
    locale,
    full: expectedFull,
    short: expectedShort,
  } of localeShortExpectations) {
    test(`should return full and short day names for ${locale}`, () => {
      const result = getLocalizedDayNames(locale)
      expect(result.full).toEqual(expectedFull)
      expect(result.short).toEqual(expectedShort)
    })
  }

  test('should return full and short day names for ru', () => {
    const result = getLocalizedDayNames('ru')
    expect(result.full).toEqual([
      'воскресенье',
      'понедельник',
      'вторник',
      'среда',
      'четверг',
      'пятница',
      'суббота',
    ])
    // Russian abbreviated day names vary by ICU version: older ICU (Linux/CI)
    // returns lowercase ('вс', 'пн', …) while newer ICU (macOS) returns
    // title-cased ('Вс', 'Пн', …). Normalize to lowercase before comparing.
    expect(result.short.map((s) => s.toLowerCase())).toEqual([
      'вс',
      'пн',
      'вт',
      'ср',
      'чт',
      'пт',
      'сб',
    ])
  })
})
