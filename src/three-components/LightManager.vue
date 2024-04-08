<script setup lang="ts">
import { AmbientLight, DirectionalLight } from 'three'
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { destroyObject3D } from '../lib/three-common'
useBeforeMount(() => {
  const env = getThreeEnv()
  console.log(env)
  const light = new AmbientLight(0x404040)

  const directionalLight = new DirectionalLight(0xffffff, 0.5)

  directionalLight.position.set(0, 0, 100)

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
