import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { getTemplate } from './template'

describe('getTemplate', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    // Create a container for test templates
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  test('should return a template element when found', () => {
    const template = document.createElement('template')
    template.id = 'test-template'
    container.appendChild(template)

    const result = getTemplate('test-template')

    expect(result).toBe(template)
    expect(result.tagName).toBe('TEMPLATE')
  })

  test('should throw an error when template not found', () => {
    expect(() => {
      getTemplate('non-existent-template')
    }).toThrow('Template non-existent-template not found')
  })

  test('should find templates by exact id match', () => {
    const template1 = document.createElement('template')
    template1.id = 'template-1'
    const template2 = document.createElement('template')
    template2.id = 'template-2'
    container.appendChild(template1)
    container.appendChild(template2)

    const result = getTemplate('template-2')

    expect(result).toBe(template2)
    expect(result.id).toBe('template-2')
  })

  test('should return template with content', () => {
    const template = document.createElement('template')
    template.id = 'content-template'
    const div = document.createElement('div')
    div.textContent = 'Test Content'
    template.content.appendChild(div)
    container.appendChild(template)

    const result = getTemplate('content-template')

    expect(result.content.firstElementChild?.textContent).toBe('Test Content')
  })
})
