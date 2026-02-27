<script setup lang="ts">
  import { InputText } from 'primevue';
import { ref } from 'vue';

  const props = defineProps<{
    value: string,
    class: string, 
  }>();

  const emits = defineEmits<{
    (e: 'update', value: string): void
  }>()

  const cachedValue = ref(props.value)

  const reset = () => cachedValue.value = props.value
</script>

<template>
  <InputText
    :class="props.class"
    :modelValue="cachedValue"
    @update:modelValue="(val) => emits('update', val ?? '')"
    @focusout="reset" 
  />
</template>