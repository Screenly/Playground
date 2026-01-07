import { describe, it, expect, afterEach } from 'bun:test'
import {
  escapeHtml,
  calculateItemsPerPage,
  getMenuItems,
  getDefaultBackgroundImage,
} from './utils'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

// eslint-disable-next-line max-lines-per-function
describe('Menu Board Tests', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>'
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      expect(escapeHtml(input)).toBe(expected)
    })

    it('should escape ampersands', () => {
      const input = 'Fish & Chips'
      const expected = 'Fish &amp; Chips'
      expect(escapeHtml(input)).toBe(expected)
    })

    it('should escape single quotes', () => {
      const input = "Chef's Special"
      const expected = 'Chef&#039;s Special'
      expect(escapeHtml(input)).toBe(expected)
    })
  })

  describe('calculateItemsPerPage', () => {
    it('should return 12 items for 1920px viewport (4 columns * 3 rows)', () => {
      expect(calculateItemsPerPage(1920)).toBe(12)
    })

    it('should return 9 items for 1600px viewport (3 columns * 3 rows)', () => {
      expect(calculateItemsPerPage(1600)).toBe(9)
    })

    it('should return 6 items for 1200px viewport (2 columns * 3 rows)', () => {
      expect(calculateItemsPerPage(1200)).toBe(6)
    })

    it('should return 3 items for smaller viewports (1 column * 3 rows)', () => {
      expect(calculateItemsPerPage(768)).toBe(3)
    })

    it('should return correct items for edge cases', () => {
      expect(calculateItemsPerPage(1919)).toBe(9)
      expect(calculateItemsPerPage(1600)).toBe(9)
      expect(calculateItemsPerPage(1199)).toBe(3)
    })
  })

  describe('getMenuItems', () => {
    it('should return empty array when no items are configured', () => {
      const mockGetSetting = () => undefined
      const result = getMenuItems(mockGetSetting)
      expect(result).toEqual([])
    })

    it('should retrieve menu items from settings', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: 'Pizza Margherita',
          item_01_description: 'Fresh tomato and basil',
          item_01_price: '12.99',
          item_01_labels: 'Vegetarian',
          item_02_name: 'Caesar Salad',
          item_02_description: 'Crispy romaine with parmesan',
          item_02_price: '8.99',
          item_02_labels: 'Gluten-free',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Pizza Margherita')
      expect(result[0].description).toBe('Fresh tomato and basil')
      expect(result[0].price).toBe('12.99')
      expect(result[0].labels).toBe('Vegetarian')
    })

    it('should trim whitespace from menu item properties', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: '  Pasta  ',
          item_01_description: '  Homemade pasta  ',
          item_01_price: '  15.99  ',
          item_01_labels: '  Gluten-free, Vegetarian  ',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result[0].name).toBe('Pasta')
      expect(result[0].description).toBe('Homemade pasta')
      expect(result[0].price).toBe('15.99')
      expect(result[0].labels).toBe('Gluten-free, Vegetarian')
    })

    it('should skip items with empty or whitespace-only names', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: 'Pizza',
          item_02_name: '',
          item_02_description: 'Should be skipped',
          item_03_name: 'Salad',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Pizza')
      expect(result[1].name).toBe('Salad')
    })
  })

  describe('getDefaultBackgroundImage', () => {
    afterEach(() => {
      resetScreenlyMock()
    })

    it('should return the HTTPS URL for Anywhere hardware', () => {
      setupScreenlyMock({
        hardware: undefined,
      })
      const result = getDefaultBackgroundImage()
      expect(result).toBe(
        'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/menu-board/assets/pizza.png',
      )
    })

    it('should return relative path for Raspberry Pi devices', () => {
      setupScreenlyMock({
        hardware: 'Raspberry Pi',
      })
      const result = getDefaultBackgroundImage()
      expect(result).toBe('assets/pizza.png')
    })

    it('should return relative path for Screenly Player Max (x86) devices', () => {
      setupScreenlyMock({
        hardware: 'Screenly Player Max',
      })
      const result = getDefaultBackgroundImage()
      expect(result).toBe('assets/pizza.png')
    })
  })
})
