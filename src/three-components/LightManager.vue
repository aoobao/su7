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

  const config = useConfig()

  const [t_env_light, t_env_night] = getItemList('t_env_light', 't_env_night') as [DataTexture, DataTexture]

  const lightEnv = createEnvMapShader(t_env_night, t_env_light, env.renderer)

  watchEffect(() => {
    const weight = config.envWeight
    const intensity = config.envIntensity

    lightEnv.setState(weight, intensity)
  })

  env.scene.environment = lightEnv.envMap

  const cancel = beforeRender(() => {
    lightEnv.update()
  }, -100)

  return () => {
    cancel()
    lightEnv.destroy()
  }
})
</script>
<template>
  <slot />
</template>
