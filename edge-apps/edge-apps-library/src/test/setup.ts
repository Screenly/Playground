import { JSDOM } from 'jsdom'

// Setup jsdom for DOM operations in tests
const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>',
  {
    url: 'http://localhost',
  },
)

global.document = dom.window.document
global.window = dom.window as unknown as Window & typeof globalThis
global.navigator = dom.window.navigator
global.Node = dom.window.Node
global.HTMLElement = dom.window.HTMLElement
global.customElements = dom.window.customElements
