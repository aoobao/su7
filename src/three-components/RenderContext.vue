<script setup lang="ts">
import { useBeforeMount } from '@/utils'
import { getThreeEnv, useThreeRender } from '@/store/three'
import { initRenderEvent } from '@/store/update'
import { Clock } from 'three'
import { update } from '@tweenjs/tween.js'
import { createSubscribe } from '@/utils/subscribe'
import { IRenderProps } from '@/types'
import { initEffectCompose } from '../effect-compose/index'
const props = defineProps({
  ftp: { type: Number, default: 60 }
})

const { registerBefore, registerAfter } = initRenderEvent()

useThreeRender(env => {
  const composerEnv = initEffectCompose(env)

  let tick = 0
  let lastTime = 0
  const clock = new Clock()
  const render = (timer: number) => {
    tick = requestAnimationFrame(render)
    const t = timer - lastTime

    if (!props.ftp || t < 1000 / props.ftp) return

    lastTime = timer
    const delta = clock.getDelta()

    env.controls.update(delta)

    update(delta) // tween.js

    registerBefore({ timer, delta })

    // if (env.composer) {
    //   env.composer.render()
    // } else {
    //   env.renderer.render(env.scene, env.camera)
    // }
    composerEnv.render()

    registerAfter({ timer, delta })
  }

  tick = requestAnimationFrame(render)

  return () => {
    // console.log('render destroy')
    cancelAnimationFrame(tick)
  }
})
</script>
<template>
  <slot />
</template>
