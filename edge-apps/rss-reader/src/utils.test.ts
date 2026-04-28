import { describe, test, expect, beforeEach } from 'bun:test'
import { stripHtml, loadCache, saveCache } from './utils'
import type { RssEntry } from './utils'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

global.localStorage = localStorageMock as unknown as Storage

const ENTRIES: RssEntry[] = [
  {
    title: 'Title 1',
    source: 'BBC News',
    content: 'Content 1',
    formattedDate: 'Mon, Dec 8, 2025',
  },
  {
    title: 'Title 2',
    source: 'BBC News',
    content: 'Content 2',
    formattedDate: 'Mon, Dec 8, 2025',
  },
]

describe('stripHtml', () => {
  test('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  test('collapses whitespace', () => {
    expect(stripHtml('<p>  foo   bar  </p>')).toBe('foo bar')
  })

  test('returns plain text unchanged', () => {
    expect(stripHtml('plain text')).toBe('plain text')
  })

  test('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })
})

describe('loadCache / saveCache', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  test('returns empty array when cache is empty', () => {
    expect(loadCache()).toEqual([])
  })

  test('returns saved entries', () => {
    saveCache(ENTRIES)
    expect(loadCache()).toEqual(ENTRIES)
  })

  test('overwrites previous cache', () => {
    saveCache(ENTRIES)
    saveCache([ENTRIES[0]])
    expect(loadCache()).toEqual([ENTRIES[0]])
  })

  test('returns empty array for malformed cache', () => {
    localStorage.setItem('rssStore', 'not-json')
    expect(loadCache()).toEqual([])
  })
})
