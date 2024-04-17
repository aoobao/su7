<script setup lang="ts">
import ThreeStage from '@/three-components/ThreeStage.vue'
import RenderContext from '@/three-components/RenderContext.vue'
import TestCube from '@/three-components/TestCube.vue'
import LightManager from '@/three-components/LightManager.vue'
import HelperView from '@/three-components/HelperView.vue'
import CarSu7 from '@/three-components/CarSu7.vue'
import StartRoom from '@/three-components/StartRoom.vue'
import LoadManager from './LoadManager.vue'
import CubeCamera from '@/three-components/CubeCamera.vue'
</script>
<template>
  <div class="main-view">
    <ThreeStage>
      <LoadManager>
        <RenderContext :ftp="60">
          <HelperView />
          <CubeCamera>
            <LightManager>
              <!-- <TestCube /> -->
              <!-- <StartRoom></StartRoom> -->
              <CarSu7></CarSu7>
            </LightManager>
          </CubeCamera>
        </RenderContext>
      </LoadManager>
    </ThreeStage>
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  width: 100%;
  height: 100%;
}
</style>
