<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '../utils/model-detail'
// import { destroyObject3D } from '../lib/three-common'
import { Texture, MeshStandardMaterial, Color } from 'three'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
const config = useConfig()

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

  const material = data.materials.Car_body as MeshStandardMaterial

  watchEffect(() => {
    material.color = new Color(config.carColor.r, config.carColor.g, config.carColor.b)
  })
  // material.color = new Color(38, 214, 233)

  env.scene.add(sm_car.scene)

  return () => {
    env.scene.remove(sm_car.scene)
  }
})
</script>
<template>
  <slot />
</template>
