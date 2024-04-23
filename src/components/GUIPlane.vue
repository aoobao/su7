<script setup lang="ts">
import { useConfig } from '../store/config'
import { useBeforeMount } from '../utils/index'
import GUI from 'lil-gui'

const { state } = useConfig()
const gui = new GUI()
useBeforeMount(() => {
  const envLight = gui.addFolder('light')
  envLight.add(state, 'envWeight', 0, 1)
  envLight.add(state, 'envIntensity', 0, 1)

  return () => {
    envLight.destroy()
  }
})
</script>
<template></template>
