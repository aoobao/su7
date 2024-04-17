import { IRenderProps } from '@/types'
import { createSubscribe } from '@/utils/subscribe'
import { defineStore } from 'pinia'

export const initRenderEvent = defineStore('initRenderEvent', () => {
  const [registerBefore, addBeforeRender] = createSubscribe<IRenderProps>()

  const [registerAfter, addAfterRender] = createSubscribe<IRenderProps>()

  return {
    registerBefore,
    registerAfter,
    addBeforeRender,
    addAfterRender
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
