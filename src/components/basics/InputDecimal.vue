<script setup lang="ts">
  import Decimal from 'decimal.js';
  import { InputText, type InputTextProps } from 'primevue';
  import { ref, watch } from 'vue';

  const model = defineModel<Decimal>({ required: true });
  const props = defineProps</* @vue-ignore */ Omit<InputTextProps, "modelValue" | "value">>();

  const textValue = ref(model.value.toString());
  const reset = () => textValue.value = model.value.toString();

  watch(textValue, (value) => {
    if (isNaN(Number(value))) return;
    model.value = new Decimal(value);
  })
</script>

<template>
  <InputText
    v-bind="props"
    v-model="textValue"
    @focusout="reset" 
    @blur="reset" 
  />
</template>
