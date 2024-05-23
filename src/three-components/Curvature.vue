<script setup lang="ts">
import { GLTF } from '@/lib/GLTFLoader'
import { useThreeRender } from '@/store/three'
import { getItemList } from '@/utils/res'
import { ShaderMaterial } from 'three'
import { updateCurvatureMaterial } from '../shaders/curvature'
import { useBeforeRender } from '@/store/update'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
const [sm_curvature] = getItemList('sm_curvature') as [GLTF]
sm_curvature.scene.visible = false

const curvature = updateCurvatureMaterial(sm_curvature)

const beforeRender = useBeforeRender()
const config = useConfig()

watchEffect(() => {
  const flag = config.showCurvature
  sm_curvature.scene.visible = flag
})

useThreeRender(env => {
  // console.log(env, sm_curvature, t_saLine)

  env.scene.add(sm_curvature.scene)

  const cancel = beforeRender(opt => {
    if (!sm_curvature.scene.visible) return
    const material = curvature?.material as ShaderMaterial | undefined
    if (material) material.uniforms.time.value = opt.timer / 1000
  })

  return () => {
    cancel()
    env.scene.remove(sm_curvature.scene)
  }
})
</script>
<template></template>
