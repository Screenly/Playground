import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRootStore = defineStore('root', () => {
  const message = ref('Hello!')

  return { message }
})
