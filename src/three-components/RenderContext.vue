<script setup lang="ts">
import { useBeforeMount } from '@/utils'
import { getThreeEnv } from '../store/three'
import { Clock } from 'three'
import { update } from '@tweenjs/tween.js'
const props = defineProps({
  ftp: { type: Number, default: 60 }
})
useBeforeMount(() => {
  // console.log('render init')
  const env = getThreeEnv()
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

    env.renderer.render(env.scene, env.camera)
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
