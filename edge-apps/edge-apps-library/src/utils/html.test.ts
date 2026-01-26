import { describe, test, expect } from 'bun:test'
import { escapeHtml } from './html'

describe('escapeHtml', () => {
  test('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  test('should escape less-than signs', () => {
    expect(escapeHtml('5 < 10')).toBe('5 &lt; 10')
  })

  test('should escape greater-than signs', () => {
    expect(escapeHtml('10 > 5')).toBe('10 &gt; 5')
  })

  test('should escape double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
  })

  test('should escape single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working')
  })

  test('should escape script tags', () => {
    const input = '<script>alert("XSS")</script>'
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    expect(escapeHtml(input)).toBe(expected)
  })

  test('should escape multiple special characters', () => {
    const input = '<div class="test">Tom & Jerry\'s "Show"</div>'
    const expected =
      '&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s &quot;Show&quot;&lt;/div&gt;'
    expect(escapeHtml(input)).toBe(expected)
  })

  test('should handle empty strings', () => {
    expect(escapeHtml('')).toBe('')
  })

  test('should handle strings with no special characters', () => {
    const input = 'Hello World 123'
    expect(escapeHtml(input)).toBe(input)
  })

  test('should escape malicious CAP feed instruction', () => {
    const input =
      'EVACUATE <script>document.location="https://evil.com"</script> NOW'
    const expected =
      'EVACUATE &lt;script&gt;document.location=&quot;https://evil.com&quot;&lt;/script&gt; NOW'
    expect(escapeHtml(input)).toBe(expected)
  })
})
