<script setup lang="ts">
import { useConfig } from '../store/config'
import { useBeforeMount } from '../utils/index'
import GUI from 'lil-gui'

const config = useConfig()
const gui = new GUI()
useBeforeMount(() => {
  const envLight = gui.addFolder('light')
  envLight.add(config, 'envWeight', 0, 1)
  envLight.add(config, 'envIntensity', 0, 1)

  const car = gui.addFolder('car')
  car.addColor(config, 'carColor')

  // const test = gui.addFolder('test')
  // test.add(state, 'strength', 0, 1)
  // test.add(state, 'radius', 0, 1)
  // test.add(state, 'threshold', 0, 1)

  return () => {
    envLight.destroy()
  }
})
</script>
<template></template>
