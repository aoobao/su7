<script setup lang="ts">
import { CubeCamera, Texture, WebGLCubeRenderTarget } from 'three'
import { getThreeEnv, useThreeRender } from '../store/three'
// import { destroyObject3D } from '../lib/three-common'
import { useBeforeRender } from '../store/update'
import { getItem } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'

const beforeRender = useBeforeRender()

useThreeRender(env => {
  const texture = getItem<Texture>('t_env_light')
  if (!texture) return

  const cubeRenderTarget = new WebGLCubeRenderTarget(512, {})
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget)

  env.scene.environment = texture
  // env.scene.background = texture
  env.scene.userData.cubeCamera = cubeCamera
  env.scene.userData.cubeRenderTarget = cubeRenderTarget

  const car = getItem<GLTF>('sm_car')
  if (car) {
    console.log(car, 'car')
  }

  const cancel = beforeRender(() => {
    cubeCamera.update(env.renderer, env.scene)
  }, -100)

  return () => {
    delete env.scene.userData.cubeCamera
    delete env.scene.userData.cubeRenderTarget
    cubeRenderTarget.dispose()
    cancel()
  }
})
</script>
<template>
  <slot />
</template>
