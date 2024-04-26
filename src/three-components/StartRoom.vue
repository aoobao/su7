<script setup lang="ts">
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
import { getItem, getItemList } from '../utils/res'
import { GLTF } from '../lib/GLTFLoader'
import { Texture, MeshStandardMaterial, Color } from 'three'
import { parseGltfModel } from '@/utils/model-detail'
import { BLOOM_LAYER } from '@/effect-compose'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
// import { destroyObject3D } from '../lib/three-common'
const env = getThreeEnv()

useBeforeMount(() => {
  // const gltf = getItem<GLTF>('sm_startroom')
  // if (!gltf) return

  const [sm_startroom, t_startroom_ao, t_startroom_light, t_floor_normal, t_floor_roughness] = getItemList('sm_startroom', 't_startroom_ao', 't_startroom_light', 't_floor_normal', 't_floor_roughness') as [GLTF, Texture, Texture, Texture, Texture]

  const data = parseGltfModel(sm_startroom)

  Object.values(data.materials).forEach(m => {
    const material = m as MeshStandardMaterial

    material.aoMap = t_startroom_ao
    material.lightMap = t_startroom_light
    material.normalMap = t_floor_normal
    material.roughnessMap = t_floor_roughness
    material.envMapIntensity = 0
  })

  // console.log(data, 'startroom')

  const light = data.materials.light as MeshStandardMaterial
  light.emissive = new Color(0xffffff)
  light.emissiveIntensity = 1
  light.depthWrite = false
  light.transparent = true

  const config = useConfig()

  watchEffect(() => {
    const colorValue = config.lightColor

    light.emissive.r = colorValue
    light.emissive.g = colorValue
    light.emissive.b = colorValue
  })

  const lightMesh = data.meshes.find(t => t.name === 'light001')!

  lightMesh.layers.disableAll()
  lightMesh.layers.enable(BLOOM_LAYER)

  env.scene.add(sm_startroom.scene)

  return () => {
    env.scene.remove(sm_startroom.scene)
  }
})
</script>
<template>
  <slot />
</template>
