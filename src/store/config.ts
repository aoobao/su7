import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

export const useConfig = defineStore('config', {
  state: () => {
    return {
      envWeight: 1, // 0:night->1:light
      envIntensity: 0.5, // 强度[0,1]
      carColor: { r: 38 / 255, g: 214 / 255, b: 233 / 255 },
      speedUp: false
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

// () => {
//   const state = reactive({
//     envWeight: 1, // 0:night->1:light
//     envIntensity: 0.5, // 强度[0,1]
//     carColor: { r: 38 / 255, g: 214 / 255, b: 233 / 255 }
//     // strength: 0.3,
//     // radius: 0.3,
//     // threshold: 0.3
//   })

//   const computedState = computed(() => {
//     const color = state.envWeight
//     const strength = Math.max(Math.pow(state.envIntensity, 2) * 0.8, 0.4)

//     console.log(color, strength, 'computed')

//     return {
//       lightColor: color,
//       lightStrength: strength
//     }
//   })

//   return {
//     state,
//     computedState
//   }
// }
