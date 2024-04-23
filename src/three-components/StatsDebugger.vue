<script setup lang="ts">
import Stats from 'stats.js'
import { useThreeRender } from '../store/three'
import { useBeforeRender, useAfterRender } from '../store/update'

const state = new Stats()
const MAX_VALUE = 10000

const beforeRender = useBeforeRender()
const afterRender = useAfterRender()

useThreeRender(() => {
  document.body.appendChild(state.dom)

  const cancels = [
    beforeRender(() => {
      state.begin()
    }, -MAX_VALUE),
    afterRender(() => {
      state.end()
    }, MAX_VALUE)
  ]

  return () => {
    cancels.forEach(cancel => cancel())
    document.body.removeChild(state.dom)
  }
})
</script>
<template></template>
