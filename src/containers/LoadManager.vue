<script setup lang="ts">
import { checkNever, useMounted, errorMessage } from '../utils'
import { reactive, computed, watchEffect } from 'vue'
import { MathUtils, PMREMGenerator } from 'three'
import { toLoadGltfFile, toLoadTexture, toLoadHdr } from '../lib/three-common'
import { setItem } from '../utils/res'
import { RES_LIST } from '../constants'
import { getThreeEnv } from '@/store/three'
import LoadAnimation from '../components/LoadAnimation.vue'
const env = getThreeEnv()
const resList = reactive(RES_LIST)

const progressNumber = computed(() => {
  const length = resList.length
  if (!length) return 0
  const step = 1 / length

  // const nums = resList.map(t => t.progress)
  const progress = resList.reduce((acc, cur) => {
    const p = MathUtils.clamp(cur.progress, 0, 1)
    const num = p * step
    // console.log(p, num)
    return acc + num
  }, 0)

  // console.log(progress, 'progress')
  return MathUtils.clamp(progress, 0, 1)
})

useMounted(() => {
  const r = new PMREMGenerator(env.renderer)
  resList.forEach(res => {
    const type = res.type

    if (type === 'gltf') {
      toLoadGltfFile(res.path, xhr => {
        res.progress = Math.min(xhr.loaded / xhr.total, 0.99)
      })
        .then(gltf => {
          return setItem(res.name, gltf)
        })
        .then(() => {
          res.progress = 1
        })
        .catch(err => {
          console.error(res)
          errorMessage(err.message)
        })
    } else if (type === 'image') {
      const ext = res.ext
      toLoadTexture(res.path)
        .then(texture => {
          // texture.colorSpace

          if (ext) {
            for (const key in ext) {
              if (key in texture) {
                // @ts-ignore
                texture[key] = ext[key]
              } else {
                console.warn('property not exist:' + key)
              }
            }
          }

          return setItem(res.name, texture)
        })
        .then(() => {
          res.progress = 1
        })
        .catch(err => {
          console.error(res)
          errorMessage(err.message)
        })
    } else if (type === 'hdr') {
      toLoadHdr(res.path, xhr => {
        res.progress = Math.min(xhr.loaded / xhr.total, 0.99)
      })
        .then(data => {
          // console.log(data)
          // const texture = r.fromEquirectangular(data.texture).texture
          return setItem(res.name, data.texture)
        })
        .then(() => {
          res.progress = 1
        })
        .catch(err => {
          console.error(err)
          errorMessage(err.message)
        })
    } else {
      checkNever(type)
    }
  })
})
</script>
<template>
  <LoadAnimation v-if="progressNumber !== 1" :progressNumber="progressNumber" />
  <slot v-else> </slot>
</template>
