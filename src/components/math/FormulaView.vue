<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    value: string,
  }>()

  const element = ref();
</script>

<template>
  <div class="w-[100%] flex flex-row justify-center my-3">
    <math-div ref="element" format="latex" :key="value">
      {{ value }}
    </math-div>
  </div>
</template>

<style>
math-div {
  font-size: 16pt
}
</style>
