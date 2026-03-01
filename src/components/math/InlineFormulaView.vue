<script setup lang="ts">
  const props = defineProps<{
    value: string,
  }>()
</script>

<template>
  <math-span format="latex" :key="props.value">
    {{ props.value }}
  </math-span>
</template>
