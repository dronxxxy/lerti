<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import "mathlive";
  import { MathfieldElement, type MathfieldElementAttributes } from "mathlive";

  type Props = Omit<Partial<MathfieldElementAttributes>, 'value'>;
  const props = defineProps<Props>();

  const modelValue = defineModel<string>();

  const mathFieldRef = ref<MathfieldElement | null>(null);

  watch(modelValue, (value) => {
    if (!mathFieldRef.value) return;
    mathFieldRef.value.value = value ?? "";
  });

  const handleInput = (event: Event) => {
    const target = event.target as MathfieldElement;
    modelValue.value = target.value;
  };

  defineExpose({
    mathField: mathFieldRef
  });

  const cleanProps = computed(() => {
    return Object.fromEntries(
      Object.entries(props).filter(([_, value]) => value != undefined)
    ) as Props;
  });
</script>

<template>
  <math-field
    :ref="mathFieldRef"
    :value="modelValue"
    v-bind="cleanProps"
    @input="handleInput"
  ></math-field>
</template>

<style>
  math-field {
    font-size: 24px;
  }
</style>