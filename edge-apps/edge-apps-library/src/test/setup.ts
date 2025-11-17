import { JSDOM } from 'jsdom'

// Setup jsdom for DOM operations in tests
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost',
})

// @ts-ignore - setting global document
global.document = dom.window.document
// @ts-ignore - setting global window
global.window = dom.window as any
// @ts-ignore - setting global navigator
global.navigator = dom.window.navigator

