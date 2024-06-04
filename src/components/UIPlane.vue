<script setup lang="ts">
import { useConfig } from '../store/config'

const config = useConfig()
const state = config.$state
</script>
<template>
  <div class="container">
    <el-form :model="state">
      <el-form-item label="envWeight">
        <el-slider v-model="state.envWeight" :min="0" :max="1" :step="0.01" />
      </el-form-item>
      <el-form-item label="envIntensity">
        <el-slider v-model="state.envIntensity" :min="0" :max="1" :step="0.01" />
      </el-form-item>
      <el-form-item label="showSpeedup">
        <el-checkbox v-model="state.showSpeedUp"></el-checkbox>
      </el-form-item>
      <el-form-item label="showCurvature">
        <el-checkbox v-model="state.showCurvature"></el-checkbox>
      </el-form-item>
      <el-form-item label="showWindSpeed">
        <el-checkbox v-model="state.showWindSpeed"></el-checkbox>
      </el-form-item>

      <el-form-item label="showCarRadar">
        <el-checkbox v-model="state.showCarRadar"></el-checkbox>
      </el-form-item>

      <el-form-item label="carColor">
        <el-color-picker v-model="state.color" color-format="rgb"></el-color-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 300px;
  position: absolute;
  right: 5px;
  top: 5px;
  background-color: #fff;
  padding: 0 4px;
  z-index: 99;
}
</style>
