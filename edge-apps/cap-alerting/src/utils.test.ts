import { describe, it, expect, mock } from 'bun:test'

// Mock the @screenly/edge-apps module
mock.module('@screenly/edge-apps', () => ({
  getCorsProxyUrl: () => 'http://localhost:8080',
  isAnywhereScreen: () => false,
}))

import { getNearestExit, splitIntoSentences, proxyUrl } from './utils'

// eslint-disable-next-line max-lines-per-function
describe('Utils', () => {
  describe('Nearest Exit Functionality', () => {
    it('should extract exit from tag with colon', () => {
      const tags = ['exit:North Lobby', 'location:Building A']
      const exit = getNearestExit(tags)
      expect(exit).toBe('North Lobby')
    })

    it('should extract exit from tag with dash', () => {
      const tags = ['exit-South Stairwell', 'floor:3']
      const exit = getNearestExit(tags)
      expect(exit).toBe('South Stairwell')
    })

    it('should be case-insensitive', () => {
      const tags = ['EXIT:West Door', 'Exit-East Door']
      const exit = getNearestExit(tags)
      expect(exit).toBe('West Door')
    })

    it('should return first exit tag found', () => {
      const tags = ['exit:First Exit', 'exit:Second Exit']
      const exit = getNearestExit(tags)
      expect(exit).toBe('First Exit')
    })

    it('should return undefined if no exit tag found', () => {
      const tags = ['location:Building A', 'floor:3']
      const exit = getNearestExit(tags)
      expect(exit).toBeUndefined()
    })

    it('should trim whitespace from exit description', () => {
      const tags = ['exit:  Main Entrance  ']
      const exit = getNearestExit(tags)
      expect(exit).toBe('Main Entrance')
    })
  })

  describe('Split Into Sentences', () => {
    it('should split text on periods', () => {
      const text = 'First sentence. Second sentence.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First sentence.', 'Second sentence.'])
    })

    it('should split text on exclamation marks', () => {
      const text = 'First sentence! Second sentence!'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First sentence!', 'Second sentence!'])
    })

    it('should split text on question marks', () => {
      const text = 'First question? Second question?'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First question?', 'Second question?'])
    })

    it('should split on mixed punctuation', () => {
      const text = 'Sentence one. Question two? Exclamation three!'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual([
        'Sentence one.',
        'Question two?',
        'Exclamation three!',
      ])
    })

    it('should handle single sentence without punctuation', () => {
      const text = 'Single sentence'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['Single sentence'])
    })

    it('should handle empty string', () => {
      const text = ''
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual([])
    })

    it('should handle string with only whitespace', () => {
      const text = '   '
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual([])
    })

    it('should trim whitespace from sentences', () => {
      const text = '  First sentence.   Second sentence.  '
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First sentence.', 'Second sentence.'])
    })

    it('should handle multiple spaces between sentences', () => {
      const text = 'First.    Second.  Third.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First.', 'Second.', 'Third.'])
    })

    it('should handle newlines and tabs', () => {
      const text = 'First.\n\nSecond.\tThird.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['First.', 'Second.', 'Third.'])
    })

    it('should preserve periods in abbreviations within a sentence', () => {
      const text = 'Dr. Smith said hello. Then he left.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['Dr. Smith said hello.', 'Then he left.'])
    })

    it('should handle trailing punctuation', () => {
      const text = 'Only one sentence.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toEqual(['Only one sentence.'])
    })
  })

  describe('Proxy URL', () => {
    it('should proxy URLs with http protocol', () => {
      const url = 'http://example.com/image.png'
      const result = proxyUrl(url)
      expect(result).toBe('http://localhost:8080/http://example.com/image.png')
    })

    it('should proxy URLs with https protocol', () => {
      const url = 'https://example.com/video.mp4'
      const result = proxyUrl(url)
      expect(result).toBe('http://localhost:8080/https://example.com/video.mp4')
    })

    it('should proxy a complete link with path and query parameters', () => {
      const url = 'https://api.example.com/v1/media?id=12345&format=json'
      const result = proxyUrl(url)
      expect(result).toBe(
        'http://localhost:8080/https://api.example.com/v1/media?id=12345&format=json',
      )
    })
  })
})
