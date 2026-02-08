import { getSettingWithDefault } from '@screenly/edge-apps'

// Types
export type MeasurementUnit = 'metric' | 'imperial'

// Get measurement unit setting
export function getMeasurementUnit(): MeasurementUnit {
  return getSettingWithDefault<MeasurementUnit>('unit', 'metric')
}
