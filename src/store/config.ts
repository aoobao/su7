import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useConfig = defineStore('config', () => {
  const state = reactive({
    envWeight: 0.5, // 0:night->1:light
    envIntensity: 0.5 // 强度[0,1]
  })

  return {
    state
  }
})
