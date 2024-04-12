<script setup lang="ts">
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '../lib/GLTFLoader'
// import { destroyObject3D } from '../lib/three-common'
const env = getThreeEnv()

useBeforeMount(() => {
  const gltf = getItem<GLTF>('sm_startroom')
  if (!gltf) return

  const resList = getItemList('t_startroom_ao', 't_startroom_light', 't_floor_normal', 't_floor_roughness')

  console.log(gltf, resList)

  env.scene.add(gltf.scene)

  return () => {
    env.scene.remove(gltf.scene)
  }
})
</script>
<template>
  <slot />
</template>
