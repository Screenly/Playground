import { describe, it, expect } from 'vitest'
import { escapeHtml } from './html'

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less-than signs', () => {
    expect(escapeHtml('5 < 10')).toBe('5 &lt; 10')
  })

  it('should escape greater-than signs', () => {
    expect(escapeHtml('10 > 5')).toBe('10 &gt; 5')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working')
  })

  it('should escape script tags', () => {
    const input = '<script>alert("XSS")</script>'
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    expect(escapeHtml(input)).toBe(expected)
  })

  it('should escape multiple special characters', () => {
    const input = '<div class="test">Tom & Jerry\'s "Show"</div>'
    const expected =
      '&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s &quot;Show&quot;&lt;/div&gt;'
    expect(escapeHtml(input)).toBe(expected)
  })

  it('should handle empty strings', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should handle strings with no special characters', () => {
    const input = 'Hello World 123'
    expect(escapeHtml(input)).toBe(input)
  })

  it('should escape malicious CAP feed instruction', () => {
    const input =
      'EVACUATE <script>document.location="https://evil.com"</script> NOW'
    const expected =
      'EVACUATE &lt;script&gt;document.location=&quot;https://evil.com&quot;&lt;/script&gt; NOW'
    expect(escapeHtml(input)).toBe(expected)
  })
})
