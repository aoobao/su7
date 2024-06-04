<script setup lang="ts">
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '@/utils/model-detail'
import { getItemList } from '@/utils/res'
import { getCarRadarMaterial } from '@/shaders/carradar'
import { CarControl } from '../lib/car_controls'
import { Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { useBeforeRender } from '@/store/update'
import { useConfig } from '@/store/config'
import { useThreeRender } from '@/store/three'
import { watchEffect } from 'vue'
const beforeRender = useBeforeRender()
const config = useConfig()

const [sm_carradar, sm_simplecar] = getItemList('sm_carradar', 'sm_simplecar') as [GLTF, GLTF]

useThreeRender(env => {
  const car1 = sm_simplecar.scene.children[0] as Mesh
  car1.renderOrder = 10
  const carMaterial = car1.material as MeshStandardMaterial

  carMaterial.transparent = true
  carMaterial.opacity = 0.3
  // carMaterial.depthWrite = false
  const car2 = car1.clone()

  const control1 = new CarControl(car1, new Vector3(1, 0.6, 3.6))
  const control2 = new CarControl(car2, new Vector3(-1, 0.6, -4.5))
  const data = parseGltfModel(sm_carradar)
  const material = getCarRadarMaterial(control1.center, control2.center)
  data.meshes.forEach(mesh => {
    mesh.material = material
    mesh.renderOrder = 1
  })

  sm_carradar.scene.visible = false
  car1.visible = false
  car2.visible = false

  env.scene.add(sm_carradar.scene, car1, car2)

  const cancel = beforeRender(({ delta, timer }) => {
    // if (!config.showCarRadar) return

    material.uniforms.time.value = timer / 1000
    control1.update(delta)
    control2.update(delta)
  })

  watchEffect(() => {
    if (config.showCarRadar) {
      sm_carradar.scene.visible = true
      car1.visible = true
      car2.visible = true
    }
  })

  return () => {
    cancel()
    env.scene.remove(sm_carradar.scene, car1, car2)
    material.dispose()
  }
})
</script>
<template></template>
