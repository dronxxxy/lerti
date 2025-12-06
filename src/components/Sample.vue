<script setup lang="ts">
  import { InputNumber, InputGroup, type InputGroupProps } from 'primevue';
  import { reactive } from 'vue';

  const props = defineProps<{
    values: ReturnType<typeof reactive<number[]>>
  }>()
</script>

<template>
  <InputGroup>
    <InputNumber
      v-for="i in props.values.length"
      :key="i"
      v-model="props.values[i - 1]"
      placeholder="0"
    />
  </InputGroup>
</template>