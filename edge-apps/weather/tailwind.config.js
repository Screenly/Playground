/** @type {import('tailwindcss').Config} */
import baseConfig from '../edge-apps-library/configs/tailwind.config.base.js'

/**
 * Tailwind Configuration
 * 
 * Extends the base configuration from @screenly/edge-apps with app-specific settings.
 * The base config includes:
 * - Design tokens (colors, typography, spacing, shadows)
 * - Signage Unit (su) plugin for reference-width-based sizing
 * - Common utilities
 */
export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Add your app-specific theme extensions here
      // Example:
      // colors: {
      //   ...baseConfig.theme.extend.colors,
      //   'custom-color': '#ff0000',
      // },
    },
  },
  plugins: [
    ...baseConfig.plugins,
    // Add your app-specific plugins here
  ],
}

