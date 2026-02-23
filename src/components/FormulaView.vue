<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    value: string
  }>()

  const element = ref();
</script>

<template>
  <math-div ref="element" format="ascii-math" :key="value">
    {{ value }}
  </math-div>
</template>