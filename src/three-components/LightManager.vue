<script setup lang="ts">
import { AmbientLight, DirectionalLight } from 'three'
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { destroyObject3D } from '../lib/three-common'

const env = getThreeEnv()

useBeforeMount(() => {
  const light = new AmbientLight(0x404040, 0.5)

  const directionalLight = new DirectionalLight(0xffffff, 0.8)

  directionalLight.position.set(0, 30, 0)

  env.scene.add(light, directionalLight)

  return () => {
    env.scene.remove(light)
    destroyObject3D(light)
  }
})
</script>
<template>
  <slot />
</template>
