import { IRenderProps } from '@/types'
import { createSubscribe } from '@/utils/subscribe'
import { defineStore } from 'pinia'
export const initRenderEvent = defineStore('initRenderEvent', () => {
  const [registerBefore, addBeforeRender] = createSubscribe<IRenderProps>()

  const [registerAfter, addAfterRender] = createSubscribe<IRenderProps>()

  const [registerResize, addResize] = createSubscribe<{ width: number; height: number; pixelRatio: number }>()

  return {
    registerBefore,
    registerAfter,
    registerResize,
    addBeforeRender,
    addAfterRender,
    addResize
  }
})

export const useBeforeRender = () => {
  const { addBeforeRender } = initRenderEvent()

  return addBeforeRender
}

export const useAfterRender = () => {
  const { addAfterRender } = initRenderEvent()
  return addAfterRender
}
