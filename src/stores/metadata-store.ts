import { ref, computed } from 'vue'

export const metadataStoreSetup = () => {
  const metadata = screenly.metadata

  const coordinates = ref(metadata.coordinates ?? '')
  const hostname = ref(metadata.hostname ?? '')
  const screenName = ref(metadata.screen_name ?? '')
  const hardware = ref(metadata.hardware ?? '')
  const location = ref(metadata.location ?? '')
  const screenlyVersion = ref(metadata.screenly_version ?? '')
  const tags = ref(metadata.tags ?? [])

  const formattedCoordinates = computed(() => {
    const [latitude, longitude] = coordinates.value

    const latString = `${Math.abs(latitude).toFixed(4)}\u00B0`
    const latDirection = latitude > 0 ? 'N' : 'S'
    const lngString = `${Math.abs(longitude).toFixed(4)}\u00B0`
    const lngDirection = longitude > 0 ? 'E' : 'W'

    return `${latString} ${latDirection}, ${lngString} ${lngDirection}`
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
