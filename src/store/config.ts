import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

export const useConfig = defineStore('config', {
  state: () => {
    return {
      envWeight: 1, // 0:night->1:light
      envIntensity: 0.5, // 强度[0,1]
      carColor: { r: 38 / 255, g: 214 / 255, b: 233 / 255 },
      showSpeedUp: false,
      showCurvature: false
    }
  },
  getters: {
    lightColor: state => {
      return Math.min(state.envWeight, 1)
    },
    lightStrength: state => {
      const strength = Math.max(Math.min(Math.pow(state.envIntensity, 2) * state.envWeight, 0.6), 0.3)
      return strength
    }
  }
})
