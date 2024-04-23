<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItemList } from '@/utils/res'
import { DataTexture } from 'three'
import { createEnvMapShader } from '../shaders/env-light'
import { useBeforeRender } from '@/store/update'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
useThreeRender(env => {
  const beforeRender = useBeforeRender()

  const { state } = useConfig()

  // const light = new AmbientLight(0x404040, 0.1)

  // const directionalLight = new DirectionalLight(0xffffff, 0.8)

  // directionalLight.position.set(0, 30, 0)

  const [t_env_light, t_env_night] = getItemList('t_env_light', 't_env_night') as [DataTexture, DataTexture]

  const lightEnv = createEnvMapShader(t_env_night, t_env_light, env.renderer)

  watchEffect(() => {
    const weight = state.envWeight
    const intensity = state.envIntensity

    lightEnv.setState(weight, intensity)
  })

  env.scene.environment = lightEnv.envMap

  const cancel = beforeRender(() => {
    lightEnv.update()
  }, -100)

  // env.scene.add(light)
  return () => {
    // env.scene.remove(light)
    // destroyObject3D(light)

    cancel()
    lightEnv.destroy()
  }
})
</script>
<template>
  <slot />
</template>
