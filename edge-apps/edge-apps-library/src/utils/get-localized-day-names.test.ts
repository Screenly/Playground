import { describe, test, expect } from 'bun:test'
import { getLocalizedDayNames } from './locale'

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

  test('should return localized longhand day names for different locales', () => {
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
      const result = getLocalizedDayNames(locale)
      expect(result.full).toEqual(expectedFull)
    }
  })

  test('should return full and shorthand day names for different locales', () => {
    const localeExpectations: Array<{
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
      {
        locale: 'ru',
        full: [
          'воскресенье',
          'понедельник',
          'вторник',
          'среда',
          'четверг',
          'пятница',
          'суббота',
        ],
        short: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
      },
    ]

    for (const {
      locale,
      full: expectedFull,
      short: expectedShort,
    } of localeExpectations) {
      const result = getLocalizedDayNames(locale)
      expect(result.full).toEqual(expectedFull)
      expect(result.short).toEqual(expectedShort)
    }
  })
})
