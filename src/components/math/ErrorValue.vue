<script setup lang="ts">
  import type Decimal from 'decimal.js';
  import InlineFormulaView from './InlineFormulaView.vue';

  const props = defineProps<{
    value: Decimal,
    error: Decimal,
    var: string,
  }>();
</script>

<template>
  <div class="p-3 text-center">
    <p class="text-2xl mt-3">Значение <InlineFormulaView>{{ props.var }} \approx {{ props.value }} \pm {{ props.error }}</InlineFormulaView></p>
  </div>
</template>