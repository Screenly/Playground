import { describe, it, expect, mock } from 'bun:test'

// Mock the @screenly/edge-apps module
mock.module('@screenly/edge-apps', () => ({
  getCorsProxyUrl: () => 'http://localhost:8080',
  isAnywhereScreen: () => false,
}))

import '@screenly/edge-apps/test'
import { getNearestExit, splitIntoSentences, proxyUrl } from './utils'
import {
  isNwsAlert,
  parseNwsTextProduct,
  parseNwsWwwiProduct,
  parseNwsPeriodProduct,
} from './parser'

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

  describe('NWS Alert Detection', () => {
    it('should detect NWS alert from official sender email', () => {
      expect(isNwsAlert('w-nws.webmaster@noaa.gov')).toBe(true)
    })

    it('should reject non-NWS sender emails', () => {
      expect(isNwsAlert('alert@weather.com')).toBe(false)
      expect(isNwsAlert('admin@example.com')).toBe(false)
      expect(isNwsAlert('nws@weather.gov')).toBe(false)
    })

    it('should be case-sensitive for NWS email', () => {
      expect(isNwsAlert('W-NWS.WEBMASTER@NOAA.GOV')).toBe(false)
    })

    it('should handle empty string', () => {
      expect(isNwsAlert('')).toBe(false)
    })
  })

  describe('NWS Text Product Formatting - Basic Patterns', () => {
    it('should parse .TODAY... pattern', () => {
      const text = '.TODAY...E wind 20 kt. Seas 11 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result).not.toBeNull()
      expect(result?.type).toBe('period')
      expect(result?.periods[0].label).toBe('TODAY')
      expect(result?.periods[0].content).toBe('E wind 20 kt. Seas 11 ft.')
    })

    it('should parse .TONIGHT... pattern', () => {
      const text = '.TONIGHT...E wind 20 kt. Seas 9 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('TONIGHT')
      expect(result?.periods[0].content).toBe('E wind 20 kt. Seas 9 ft.')
    })

    it('should parse multiple periods', () => {
      const text =
        '.TODAY...E wind 20 kt. Seas 11 ft. .TONIGHT...E wind 20 kt. Seas 9 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods.length).toBe(2)
      expect(result?.periods[0].label).toBe('TODAY')
      expect(result?.periods[1].label).toBe('TONIGHT')
    })

    it('should parse day abbreviations (MON, TUE, etc.)', () => {
      const text = '.MON...Variable wind 10 kt. .TUE...Variable wind 10 kt.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('MON')
      expect(result?.periods[1].label).toBe('TUE')
    })

    it('should handle full day names (MONDAY, TUESDAY, etc.)', () => {
      const text = '.MONDAY...E wind 15 kt. .TUESDAY...SE wind 20 kt.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('MONDAY')
      expect(result?.periods[1].label).toBe('TUESDAY')
    })
  })

  describe('NWS Text Product Formatting - Qualifiers', () => {
    it('should handle period qualifiers like NIGHT', () => {
      const text = '.SUN NIGHT...Variable wind 10 kt. Seas 7 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('SUN NIGHT')
    })

    it('should handle period qualifiers like MORNING and AFTERNOON', () => {
      const text =
        '.SAT MORNING...E wind 15 kt. .SAT AFTERNOON...SE wind 20 kt.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('SAT MORNING')
      expect(result?.periods[1].label).toBe('SAT AFTERNOON')
    })

    it('should handle THROUGH period ranges', () => {
      const text = '.SUN THROUGH MON...SE wind 15 kt. Seas 7 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('SUN THROUGH MON')
    })

    it('should handle AND combinations like SUN AND SUN NIGHT', () => {
      const text = '.SUN AND SUN NIGHT...NE wind 15 kt. Seas 6 ft.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('SUN AND SUN NIGHT')
    })
  })

  describe('NWS Text Product Formatting - Real Examples', () => {
    it('should format real NWS marine forecast with preamble', () => {
      const text = `Coastal Waters Forecast for the Northern Gulf of Alaska Coast up to 100 nm out including Kodiak Island and Cook Inlet. Wind forecasts reflect the predominant speed and direction expected. Sea forecasts represent an average of the highest one-third of the combined wind wave and swell height. .TODAY...E wind 20 kt. Seas 11 ft. .TONIGHT...E wind 20 kt. Seas 9 ft. .SUN...E wind 20 kt. Seas 7 ft.`

      const result = parseNwsPeriodProduct(text)
      // Should have preamble
      expect(result?.preamble).toContain('Coastal Waters Forecast')
      // Should have forecast periods
      expect(result?.periods.length).toBe(3)
      expect(result?.periods[0].label).toBe('TODAY')
      expect(result?.periods[1].label).toBe('TONIGHT')
      expect(result?.periods[2].label).toBe('SUN')
    })

    it('should format complex example with AND pattern', () => {
      const text = `Coastal Waters Forecast... .TONIGHT...Variable wind 10 kt becoming NE 15 kt after midnight. Seas 15 ft subsiding to 10 ft after midnight. .SAT...E wind 25 kt. Seas 10 ft. .SAT NIGHT...E wind 25 kt. Seas 9 ft. .SUN AND SUN NIGHT...NE wind 15 kt. Seas 6 ft. .MON...NE wind 15 kt. Seas 5 ft.`

      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('TONIGHT')
      expect(result?.periods[1].label).toBe('SAT')
      expect(result?.periods[2].label).toBe('SAT NIGHT')
      expect(result?.periods[3].label).toBe('SUN AND SUN NIGHT')
      expect(result?.periods[4].label).toBe('MON')
    })

    it('should preserve preamble text before first period marker', () => {
      const text = 'Synopsis: High pressure continues. .TODAY...E wind 20 kt.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.preamble).toBe('Synopsis: High pressure continues.')
      expect(result?.periods[0].label).toBe('TODAY')
    })
  })

  describe('NWS Text Product Formatting - Edge Cases', () => {
    it('should not modify text without NWS period format', () => {
      const text = 'This is a regular weather alert without special formatting.'
      const result = parseNwsTextProduct(text)
      expect(result).toBeNull()
    })

    it('should handle case-insensitive period patterns', () => {
      const text = '.today...Wind 10 kt. .Tonight...Wind 5 kt.'
      const result = parseNwsPeriodProduct(text)
      expect(result?.periods[0].label).toBe('today')
      expect(result?.periods[1].label).toBe('Tonight')
    })

    it('should return null for empty input', () => {
      expect(parseNwsTextProduct('')).toBeNull()
    })
  })

  describe('NWS WWWI Format - Basic Patterns', () => {
    it('should format * WHAT... pattern', () => {
      const text = '* WHAT...North winds 25 to 30 kt with gusts up to 35 kt.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('WHAT')
      expect(result?.sections[0].content).toBe(
        'North winds 25 to 30 kt with gusts up to 35 kt.',
      )
    })

    it('should format * WHERE... pattern', () => {
      const text = '* WHERE...Pt St George to Cape Mendocino 10 to 60 nm.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('WHERE')
      expect(result?.sections[0].content).toBe(
        'Pt St George to Cape Mendocino 10 to 60 nm.',
      )
    })

    it('should format * WHEN... pattern', () => {
      const text = '* WHEN...Until 3 AM PST Saturday.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('WHEN')
      expect(result?.sections[0].content).toBe('Until 3 AM PST Saturday.')
    })

    it('should format * IMPACTS... pattern', () => {
      const text = '* IMPACTS...Strong winds will cause hazardous seas.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('IMPACTS')
      expect(result?.sections[0].content).toBe(
        'Strong winds will cause hazardous seas.',
      )
    })

    it('should format * IMPACT... pattern (singular)', () => {
      const text = '* IMPACT...Flooding of low-lying areas.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('IMPACT')
      expect(result?.sections[0].content).toBe('Flooding of low-lying areas.')
    })
  })

  describe('NWS WWWI Format - Complete Examples', () => {
    it('should format complete WWWI alert', () => {
      const text =
        '* WHAT...North winds 25 to 30 kt with gusts up to 35 kt and seas 9 to 12 feet. * WHERE...Pt St George to Cape Mendocino 10 to 60 nm and Cape Mendocino to Pt Arena 10 to 60 nm. * WHEN...Until 3 AM PST Saturday. * IMPACTS...Strong winds will cause hazardous seas which could capsize or damage vessels and reduce visibility. '
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections.length).toBe(4)
      expect(result?.sections[0].label).toBe('WHAT')
      expect(result?.sections[0].content).toContain('North winds 25 to 30 kt')
      expect(result?.sections[1].label).toBe('WHERE')
      expect(result?.sections[1].content).toContain(
        'Pt St George to Cape Mendocino',
      )
      expect(result?.sections[2].label).toBe('WHEN')
      expect(result?.sections[2].content).toBe('Until 3 AM PST Saturday.')
      expect(result?.sections[3].label).toBe('IMPACTS')
      expect(result?.sections[3].content).toContain(
        'Strong winds will cause hazardous seas',
      )
    })

    it('should output list items for WWWI sections', () => {
      const text =
        '* WHAT...Heavy rain. * WHERE...Coastal areas. * WHEN...Tonight.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].content).toBe('Heavy rain.')
      expect(result?.sections[1].content).toBe('Coastal areas.')
      expect(result?.sections[2].content).toBe('Tonight.')
    })
  })

  describe('NWS WWWI Format - Edge Cases', () => {
    it('should not modify text without WWWI format', () => {
      const text = 'Regular weather alert text without special markers.'
      const result = parseNwsWwwiProduct(text)
      expect(result).toBeNull()
    })

    it('should handle case-insensitive WWWI patterns', () => {
      const text = '* what...Heavy rain. * Where...Coastal areas.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('what')
      expect(result?.sections[1].label).toBe('Where')
    })

    it('should return null for empty input', () => {
      expect(parseNwsWwwiProduct('')).toBeNull()
    })

    it('should handle ADDITIONAL DETAILS section', () => {
      const text = '* WHAT...Snow. * ADDITIONAL DETAILS...Expect travel delays.'
      const result = parseNwsWwwiProduct(text)
      expect(result?.sections[0].label).toBe('WHAT')
      expect(result?.sections[0].content).toBe('Snow.')
      expect(result?.sections[1].label).toBe('ADDITIONAL DETAILS')
      expect(result?.sections[1].content).toBe('Expect travel delays.')
    })
  })

  describe('NWS Combined Format Detection', () => {
    it('should detect and format WWWI format via parseNwsTextProduct', () => {
      const text = '* WHAT...Heavy snow. * WHEN...Tonight through tomorrow.'
      const result = parseNwsTextProduct(text)
      expect(result?.type).toBe('wwwi')
      if (result?.type === 'wwwi') {
        expect(result.sections[0].label).toBe('WHAT')
        expect(result.sections[0].content).toBe('Heavy snow.')
        expect(result.sections[1].label).toBe('WHEN')
        expect(result.sections[1].content).toBe('Tonight through tomorrow.')
      }
    })

    it('should detect and format period format via parseNwsTextProduct', () => {
      const text = '.TODAY...E wind 20 kt. .TONIGHT...E wind 15 kt.'
      const result = parseNwsTextProduct(text)
      expect(result?.type).toBe('period')
      if (result?.type === 'period') {
        expect(result.periods[0].label).toBe('TODAY')
        expect(result.periods[0].content).toBe('E wind 20 kt.')
        expect(result.periods[1].label).toBe('TONIGHT')
        expect(result.periods[1].content).toBe('E wind 15 kt.')
      }
    })

    it('should prefer WWWI format when both patterns present', () => {
      // This is an edge case - in practice alerts use one format or the other
      const text = '* WHAT...Storm. .TODAY...E wind.'
      const result = parseNwsTextProduct(text)
      // WWWI format should be detected and applied
      expect(result?.type).toBe('wwwi')
    })
  })
})
