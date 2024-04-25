import { IThreeEnvironment, createThreeEnvironment, useBeforeMount } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { initRenderEvent } from './update'

export const useInitThreeStage = defineStore('initThreeStage', () => {
  // const env = shallowRef<IThreeEnvironment>()
  console.log('init stage')
  let env: IThreeEnvironment | undefined = undefined
  let observer: ResizeObserver | undefined
  // const isCreated = computed(() => !!env.value)
  const isCreated = ref(false)

  const { registerResize } = initRenderEvent()

  const destroy = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }

    if (env) {
      const e = env

      e.controls.dispose()
      e.renderer.dispose()

      e.composer?.dispose()

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

      // const width = clientWidth * pixelRatio
      // const height = clientHeight * pixelRatio
      e.camera.aspect = clientWidth / clientHeight
      e.camera.updateProjectionMatrix()
      e.renderer.setSize(clientWidth, clientHeight)
      e.renderer.setPixelRatio(pixelRatio)

      if (e.composer) {
        e.composer.setSize(clientWidth, clientHeight)
        e.composer.setPixelRatio(pixelRatio)
      }

      registerResize({ width: clientWidth, height: clientHeight, pixelRatio })
    }

    observer = new ResizeObserver(resetSize)
    observer.observe(dom)
    isCreated.value = true
  }

  const getEnv = () => {
    // if (!env) throw new Error('env is not created')
    return env
  }

  return {
    isCreated,
    getEnv,
    destroy,
    init
  }
})

type Func = () => void

export const useThreeRender = (initFunc: (env: IThreeEnvironment) => Func | void) => {
  const stage = useInitThreeStage()

  useBeforeMount(() => {
    // if (!stage._env) return
    const env = stage.getEnv()
    if (!env) return

    return initFunc(env)
  })
}

export const getThreeEnv = () => {
  const stage = useInitThreeStage()

  const env = stage.getEnv()

  if (!env) throw new Error('env is not created')

  return env
}
