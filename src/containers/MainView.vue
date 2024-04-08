<script setup lang="ts">
import ThreeStage from '@/three-components/ThreeStage.vue'
import RenderContext from '@/three-components/RenderContext.vue'
import TestCube from '@/three-components/TestCube.vue'
import LightManager from '@/three-components/LightManager.vue'
import HelperView from '@/three-components/HelperView.vue'
</script>
<template>
  <div class="main-view">
    <ThreeStage>
      <RenderContext :ftp="60">
        <HelperView />

        <LightManager>
          <TestCube />
        </LightManager>
      </RenderContext>
    </ThreeStage>
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  width: 100%;
  height: 100%;
}
</style>
