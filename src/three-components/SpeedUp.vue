<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItem } from '../utils/res'
import { useBeforeRender } from '../store/update'
import { GLTF } from '../lib/GLTFLoader'
import { parseGltfModel } from '@/utils/model-detail'
import { createSpeedUpMaterial } from '../shaders/speedup'
import { ENVIRONMENT_LAYER, REFLECT_LAYER } from '@/constants'
import { MathUtils } from 'three'
import { watchEffect } from 'vue'
import { useConfig } from '@/store/config'
import { Easing, Tween } from '@tweenjs/tween.js'
const beforeRender = useBeforeRender()

useThreeRender(env => {
  const speedUp = getItem<GLTF>('sm_speedup')
  if (!speedUp) return

  const data = parseGltfModel(speedUp)

  const material = createSpeedUpMaterial()

  data.meshes.forEach(mesh => {
    mesh.material = material
    mesh.layers.enable(REFLECT_LAYER)
    mesh.layers.enable(ENVIRONMENT_LAYER)
  })

  speedUp.scene.visible = false
  env.scene.add(speedUp.scene)

  // const tween =

  const config = useConfig()

  const state = {
    speed: 0
  }

  let tween: Tween<{ speed: number }> | undefined

  watchEffect(() => {
    const start = config.speedUp

    if (tween) {
      tween.stop()
    }
    if (start) {
      tween = new Tween(state).to({ speed: 8 }, 3000).start()
    } else {
      tween = new Tween(state).to({ speed: 0 }, 3000).start()
    }
  })

  const cancel = beforeRender(({ delta }) => {
    // material.uniforms.uTime.value = timer / 1000

    // MathUtils.lerp
    // console.log(delta)

    // speedUp.scene.opacity = state.speed

    if (state.speed > 0.1) {
      speedUp.scene.visible = true
      material.uniforms.uTime.value += (delta * state.speed) / 3
      material.uniforms.uSpeed.value = state.speed

      // console.log(material.uniforms.uSpeed.value, material.uniforms.uTime.value)
    } else {
      speedUp.scene.visible = false
    }
  })

  return () => {
    cancel()

    env.scene.remove(speedUp.scene)
  }
})
</script>
<template></template>
