<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '../utils/model-detail'
// import { destroyObject3D } from '../lib/three-common'
import { Texture, MeshStandardMaterial } from 'three'
useThreeRender(env => {
  const gltf = getItem<GLTF>('sm_car')
  if (!gltf) return

  const data = parseGltfModel(gltf)

  console.log(data, env.scene.userData, 'car view')
  const [car_body_ao] = getItemList('t_car_body_AO') as Texture[]
  Object.values(data.materials).forEach(e => {
    const m = e as MeshStandardMaterial
    m.aoMap = car_body_ao

    m.envMap = env.scene.environment
  })
      '
      /'

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
