<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '../utils/model-detail'
// import { destroyObject3D } from '../lib/three-common'
import { Texture, MeshStandardMaterial, Color } from 'three'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
import { REFLECT_LAYER } from '@/constants'
import { updateCarBounding, updateCarMaterial } from '../utils/car'
const config = useConfig()

useThreeRender(env => {
  // console.log(data, env.scene.userData, 'car view')
  const [sm_car, car_body_ao] = getItemList('sm_car', 't_car_body_AO') as [GLTF, Texture]
  const data = parseGltfModel(sm_car)

  // console.log(data, 'sm_car')

  data.meshes.forEach(m => {
    m.layers.enable(REFLECT_LAYER)
  })

  Object.values(data.materials).forEach(e => {
    const m = e as MeshStandardMaterial
    m.aoMap = car_body_ao

    updateCarMaterial(m)
    // m.envMap = env.scene.environment
  })

  updateCarBounding(sm_car.scene)

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
