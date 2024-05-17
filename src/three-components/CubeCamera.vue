<script setup lang="ts">
import { CubeCamera, Texture, WebGLCubeRenderTarget, ClampToEdgeWrapping, LinearFilter, LinearMipMapLinearFilter, UnsignedByteType } from 'three'
import { getThreeEnv, useThreeRender } from '../store/three'
// import { destroyObject3D } from '../lib/three-common'
import { useBeforeRender } from '../store/update'
import { getItem } from '../utils/res'
import { GLTF } from '@/lib/GLTFLoader'
import { ENVIRONMENT_LAYER } from '@/constants'
import { global } from '@/store/global'

const beforeRender = useBeforeRender()

useThreeRender(env => {
  const texture = getItem<Texture>('t_env_light')
  if (!texture) return

  const cubeRenderTarget = new WebGLCubeRenderTarget(512, {
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    magFilter: LinearFilter,
    minFilter: LinearMipMapLinearFilter,
    anisotropy: 0,
    colorSpace: 'srgb-linear',
    generateMipmaps: true,
    samples: 0,
    stencilBuffer: false,
    type: UnsignedByteType
  })
  const cubeCamera = new CubeCamera(1, 100, cubeRenderTarget)
  cubeCamera.layers.set(ENVIRONMENT_LAYER)
  // env.scene.environment = texture
  // env.scene.background = texture
  // env.scene.userData.cubeCamera = cubeCamera
  // env.scene.userData.cubeRenderTarget = cubeRenderTarget

  // const car = getItem<GLTF>('sm_car')
  // if (car) {
  //   console.log(car, 'car')
  // }

  global.cubeRenderTarget.value = cubeRenderTarget

  const cancel = beforeRender(() => {
    cubeCamera.update(env.renderer, env.scene)
  }, -100)

  return () => {
    cubeRenderTarget.dispose()
    cancel()
  }
})
</script>
<template>
  <slot />
</template>
