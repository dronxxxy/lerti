<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    value: string,
    format?: "ascii-math" | "latex"
  }>()

  const element = ref();
</script>

<template>
  <div class="w-[100%] flex flex-row justify-center my-3">
    <math-div ref="element" :format="props.format ?? 'ascii-math'" :key="value">
      {{ value }}
    </math-div>
  </div>
</template>

<style>
math-div {
  font-size: 16pt
}
</style>