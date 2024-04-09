<script setup lang="ts">
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { getItem } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'

// import { destroyObject3D } from '../lib/three-common'
const env = getThreeEnv()
useBeforeMount(() => {
  const gltf = getItem<GLTF>('sm_car')
  if (!gltf) return
  const object = gltf.scene.children[0]
  env.scene.add(object)

  return () => {
    env.scene.remove(object)
  }
})
</script>
<template>
  <slot />
</template>
