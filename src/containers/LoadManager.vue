<script setup lang="ts">
import { checkNever, useMounted } from '../utils'
import { reactive, computed, watchEffect } from 'vue'
import { MathUtils } from 'three'
import { toLoadGltfFile } from '../lib/three-common'
import { setItem } from '../utils/res'
import { RES_LIST } from '../constants'

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

// watchEffect(() => {
//   console.log(progressNumber.value)
// })

useMounted(() => {
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
          alert(err.message)
        })
    } else {
      checkNever(type)
    }
  })
})
</script>
<template>
  <div class="loader" v-if="progressNumber !== 1">
    {{ progressNumber }}
  </div>
  <slot v-else> </slot>
</template>

<style lang="scss" scoped>
.loader {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
