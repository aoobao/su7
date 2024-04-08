<script setup lang="ts">
import { AxesHelper } from 'three'
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { destroyObject3D } from '../lib/three-common'

useBeforeMount(() => {
  const axesHelper = new AxesHelper(5)
  const env = getThreeEnv()

  env.scene.add(axesHelper)

  return () => {
    env.scene.remove(axesHelper)
    destroyObject3D(axesHelper)
  }
})
</script>
<template>
  <slot />
</template>
