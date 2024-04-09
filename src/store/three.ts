import { IThreeEnvironment, createThreeEnvironment } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

export const useInitThreeStage = defineStore('initThreeStage', () => {
  // const env = shallowRef<IThreeEnvironment>()
  console.log('init stage')
  let env: IThreeEnvironment | undefined = undefined
  let observer: ResizeObserver | undefined
  // const isCreated = computed(() => !!env.value)
  const isCreated = ref(false)

  const destroy = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }

    if (env) {
      const e = env

      e.controls.dispose()
      e.renderer.dispose()

      env = undefined
    }
    isCreated.value = false
  }

  const init = (dom: HTMLDivElement) => {
    if (env) {
      console.warn('ThreeEnv is already created')
      destroy()
    }

    const e = createThreeEnvironment(dom)
    env = e
    // just a test
    window.env = env

    const resetSize = () => {
      const { clientWidth, clientHeight } = dom
      const pixelRatio = window.devicePixelRatio
      e.camera.aspect = clientWidth / clientHeight
      e.camera.updateProjectionMatrix()
      e.renderer.setSize(clientWidth, clientHeight)
      e.renderer.setPixelRatio(pixelRatio)
    }

    observer = new ResizeObserver(resetSize)
    observer.observe(dom)
    isCreated.value = true
  }

  const getEnv = () => {
    if (!env) throw new Error('env is not created')
    return env
  }

  return {
    // env: env,
    isCreated,
    getEnv,
    destroy,
    init
  }
})

export const getThreeEnv = () => {
  const stage = useInitThreeStage()

  const env = stage.getEnv()

  return env
}
