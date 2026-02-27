<script setup lang="ts">
  const props = defineProps<{
    value?: string,
    format?: "ascii-math" | "latex"
  }>()
</script>

<template>
  <math-span :format="props.format ?? 'latex'" :key="props.value">
    <slot v-if="value === undefined"></slot>
    {{ props.value }}
  </math-span>
</template>