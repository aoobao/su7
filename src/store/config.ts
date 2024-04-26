import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useConfig = defineStore('config', () => {
  const state = reactive({
    envWeight: 0.5, // 0:night->1:light
    envIntensity: 0.5, // 强度[0,1]
    carColor: { r: 38 / 255, g: 214 / 255, b: 233 / 255 },
    strength: 0.3,
    radius: 0.3,
    threshold: 0.3
  })

  return {
    state
  }
})
