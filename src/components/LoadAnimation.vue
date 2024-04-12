<script setup lang="ts">
defineProps({
  progressNumber: {
    type: Number,
    default: 0
  }
})
</script>
<template>
  <div class="loading">
    {{ progressNumber }}
  </div>
</template>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100%;
  position: fixed;
}
</style>
