<script setup lang="ts">
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { getItem } from '../utils/res'
import { GLTF } from '../lib/GLTFLoader'
// import { destroyObject3D } from '../lib/three-common'
const env = getThreeEnv()

useBeforeMount(() => {
  const gltf = getItem<GLTF>('sm_startroom')
  if (!gltf) return
  // env.scene.add(gltf.scene)
  // console.log(gltf)
  env.scene.add(gltf.scene)

  return () => {
    env.scene.remove(gltf.scene)
  }
})
</script>
<template>
  <slot />
</template>
