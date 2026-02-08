// Import weather icons
import clearIcon from '../static/images/icons/clear.svg'
import clearNightIcon from '../static/images/icons/clear-night.svg'
import cloudyIcon from '../static/images/icons/cloudy.svg'
import drizzleIcon from '../static/images/icons/drizzle.svg'
import fewdropsIcon from '../static/images/icons/fewdrops.svg'
import fogIcon from '../static/images/icons/fog.svg'
import hazeIcon from '../static/images/icons/haze.svg'
import mostlyCloudyIcon from '../static/images/icons/mostly-cloudy.svg'
import mostlyCloudyNightIcon from '../static/images/icons/mostly-cloudy-night.svg'
import partiallyCloudyIcon from '../static/images/icons/partially-cloudy.svg'
import partiallyCloudyNightIcon from '../static/images/icons/partially-cloudy-night.svg'
import partlySunnyIcon from '../static/images/icons/partlysunny.svg'
import rainyIcon from '../static/images/icons/rainy.svg'
import rainNightIcon from '../static/images/icons/rain-night.svg'
import sleetIcon from '../static/images/icons/sleet.svg'
import sleetNightIcon from '../static/images/icons/sleet-night.svg'
import snowIcon from '../static/images/icons/snow.svg'
import thunderstormIcon from '../static/images/icons/thunderstorm.svg'
import thunderstormNightIcon from '../static/images/icons/thunderstorm-night.svg'
import windyIcon from '../static/images/icons/windy.svg'
import chancesleetIcon from '../static/images/icons/chancesleet.svg'

// Weather icon mapping
export const WEATHER_ICONS: Record<string, string> = {
  clear: clearIcon,
  'clear-night': clearNightIcon,
  cloudy: cloudyIcon,
  drizzle: drizzleIcon,
  fewdrops: fewdropsIcon,
  fog: fogIcon,
  haze: hazeIcon,
  'mostly-cloudy': mostlyCloudyIcon,
  'mostly-cloudy-night': mostlyCloudyNightIcon,
  'partially-cloudy': partiallyCloudyIcon,
  'partially-cloudy-night': partiallyCloudyNightIcon,
  partlysunny: partlySunnyIcon,
  rainy: rainyIcon,
  'rain-night': rainNightIcon,
  sleet: sleetIcon,
  'sleet-night': sleetNightIcon,
  snow: snowIcon,
  thunderstorm: thunderstormIcon,
  'thunderstorm-night': thunderstormNightIcon,
  windy: windyIcon,
  chancesleet: chancesleetIcon,
}
