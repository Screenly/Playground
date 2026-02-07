/// <reference types="vite/client" />

declare module '*.html?raw' {
  const content: string
  export default content
}

declare module '*.css?raw' {
  const content: string
  export default content
}
