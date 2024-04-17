<script setup lang="ts">
import { getThreeEnv } from '@/store/three'
import { useBeforeMount } from '../utils/index'
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { destroyObject3D } from '@/lib/three-common'
import { useBeforeRender } from '@/store/update'

const beforeRender = useBeforeRender()

useBeforeMount(() => {
  console.log('test cube init')
  const env = getThreeEnv()
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial({ color: 0x00ff00 })
  const mesh = new Mesh(geometry, material)
  env.scene.add(mesh)

  const cancel = beforeRender(() => {
    mesh.rotation.x += 0.01
  })

  return () => {
    cancel()
    console.log('test cube destroy')
    env.scene.remove(mesh)
    destroyObject3D(mesh)
  }
})
</script>
<template></template>
