<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '../utils/model-detail'
// import { destroyObject3D } from '../lib/three-common'
import { Texture, MeshStandardMaterial, Color } from 'three'
useThreeRender(env => {
  // console.log(data, env.scene.userData, 'car view')
  const [sm_car, car_body_ao] = getItemList('sm_car', 't_car_body_AO') as [GLTF, Texture]
  const data = parseGltfModel(sm_car)

  console.log(data, 'sm_car')

  Object.values(data.materials).forEach(e => {
    const m = e as MeshStandardMaterial
    m.aoMap = car_body_ao
    // m.envMap = env.scene.environment
  })
  // const object = sm_car.scene.children[0]
  // data.materials.

  const material = data.materials.Car_body as MeshStandardMaterial
  material.color = new Color(0x26d6e9)

  env.scene.add(sm_car.scene)

  return () => {
    env.scene.remove(sm_car.scene)
  }
})
</script>
<template>
  <slot />
</template>
