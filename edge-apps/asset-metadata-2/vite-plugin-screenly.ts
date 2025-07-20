import type { ViteDevServer, Plugin } from 'vite'

// Configuration object for screenly data
const screenlyConfig = {
  metadata: {
    coordinates: [37.3861, -122.0839] as [number, number],
    hostname: 'dev-hostname',
    screen_name: 'Development Server',
    hardware: 'x86',
    location: 'Development Environment',
    screenly_version: 'development-server',
    tags: ['Development']
  },
  settings: {
    enable_analytics: 'true',
    tag_manager_id: '',
    theme: 'light' as const,
    screenly_color_accent: '#972EFF',
    screenly_color_light: '#ADAFBE',
    screenly_color_dark: '#454BD2'
  },
  cors_proxy_url: 'https://cors-proxy.screenly.io'
}

// Template function to generate the screenly object
function generateScreenlyObject(config: typeof screenlyConfig) {
  return `// Generated screenly.js for development mode
    window.screenly = {
      signalReadyForRendering: () => {
        console.log('🟢 Screenly: App ready for rendering (dev mode)')
      },
      metadata: ${JSON.stringify(config.metadata, null, 2)},
      settings: ${JSON.stringify(config.settings, null, 2)},
      cors_proxy_url: ${JSON.stringify(config.cors_proxy_url)}
    }`
}

export function screenlyPlugin(mode: string): Plugin {
  return {
    name: 'generate-screenly-js',
    configureServer(server: ViteDevServer) {
      if (mode === 'development') {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/screenly.js?version=1') {
            const screenlyJsContent = generateScreenlyObject(screenlyConfig)

            res.setHeader('Content-Type', 'application/javascript')
            res.end(screenlyJsContent)
            return
          }
          next()
        })
      }
    },
  }
}
