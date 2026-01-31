import { ref, computed } from 'vue'
import {
  getMetadata,
  getScreenName,
  getHostname,
  getLocation,
  getScreenlyVersion,
  getTags,
} from '../../utils/metadata.js'
import { formatCoordinates } from '../../utils/locale.js'

export const metadataStoreSetup = () => {
  const metadata = getMetadata()

  const coordinates = ref(metadata.coordinates ?? [0, 0])
  const hostname = ref(getHostname() ?? '')
  const screenName = ref(getScreenName() ?? '')
  const hardware = ref(metadata.hardware ?? '')
  const location = ref(getLocation() ?? '')
  const screenlyVersion = ref(getScreenlyVersion() ?? '')
  const tags = ref(getTags() ?? [])

  const formattedCoordinates = computed(() => {
    return formatCoordinates(coordinates.value as [number, number])
  })

  return {
    coordinates,
    hostname,
    screenName,
    hardware,
    location,
    screenlyVersion,
    tags,
    formattedCoordinates,
  }
}

export type MetadataStore = ReturnType<typeof metadataStoreSetup>
