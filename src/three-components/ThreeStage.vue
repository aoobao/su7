<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useInitThreeStage } from '@/store/three'
import { useMounted } from '@/utils';
const wrap = ref<HTMLDivElement>()
const stage = useInitThreeStage()

useMounted(() => {
  // console.log('stage init')
  if (!wrap.value) return
  stage.init(wrap.value)

  return () => {
    // console.log('stage destroy')
    stage.destroy()
  }
})
</script>
<template>
  <div ref="wrap" class="stage">
    <slot v-if="stage.isCreated" />
  </div>
</template>

<style lang="scss" scoped>
.stage {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
}
</style>
