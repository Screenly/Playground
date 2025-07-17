import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRootStore = defineStore('root', () => {
  const message = ref('Hello!')

  return { message }
})

export const useScreenlyMetadataStore = defineStore('metadata', () => {
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
    return `${latitude}, ${longitude}`
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
})
