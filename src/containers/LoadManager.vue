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
  if (!length) return 1
  const step = 1 / length
  const progress = resList.reduce((acc, cur) => {
    const p = MathUtils.clamp(cur.progress, 0, 1) / 1
    return acc + p * step
  }, 0)

  return MathUtils.clamp(progress, 0, 1)
})

watchEffect(() => {
  console.log(progressNumber.value)
})

useMounted(() => {
  resList.forEach(res => {
    const type = res.type

    if (type === 'gltf') {
      toLoadGltfFile(res.path, xhr => {
        console.log(res.name, xhr.loaded, xhr.total)
        res.progress = xhr.loaded / xhr.total
      })
        .then(gltf => {
          res.progress = 1
          // console.log(gltf)
          setItem(res.name, gltf)
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
