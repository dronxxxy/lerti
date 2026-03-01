<script setup lang="ts">
  import type Decimal from 'decimal.js';
  import InlineFormulaView from './InlineFormulaView.vue';
  import { roundErrorString, roundValueString } from '@/shared/math/rounding';
  import { computed } from 'vue';

  const props = defineProps<{
    value: Decimal,
    error: Decimal,
    var: string,
  }>();

  const formula = computed(() => `${ props.var } \\approx ${roundValueString(props.value, props.error)} \\pm ${roundErrorString(props.error)}`)
</script>

<template>
  <div class="p-3 text-center">
    <p class="text-2xl mt-3">Значение <InlineFormulaView :value="formula" /></p>
  </div>
</template>
