<script setup lang="ts">
import { AxesHelper } from 'three'
import { useBeforeMount } from '../utils/index'
import { getThreeEnv } from '../store/three'
// import { destroyObject3D } from '../lib/three-common'

useBeforeMount(() => {
  const env = getThreeEnv()
})
</script>
<template>
  <slot />
</template>
