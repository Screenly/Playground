/** @type {import('tailwindcss').Config} */
/**
 * Base Tailwind Configuration for Screenly Edge Apps
 * 
 * This config provides a minimal base that can be extended by individual apps.
 * Apps should import this config using:
 * 
 * @example
 * import baseConfig from '../edge-apps-library/configs/tailwind.config.base.js'
 * 
 * export default {
 *   ...baseConfig,
 *   content: [
 *     './index.html',
 *     './src/**' + '/*.{js,ts,jsx,tsx}',
 *   ],
 *   theme: {
 *     ...baseConfig.theme,
 *     extend: {
 *       ...baseConfig.theme.extend,
 *       // Your app-specific extensions
 *     },
 *   },
 *   plugins: [
 *     ...baseConfig.plugins,
 *     // Your app-specific plugins
 *   ],
 * }
 */

export default {
  theme: {
    extend: {},
  },
  plugins: [],
}
