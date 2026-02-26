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

  const error = computed(() => roundErrorString(props.error))
  const value = computed(() => roundValueString(props.value, props.error))
</script>

<template>
  <div class="p-3 text-center">
    <p class="text-2xl mt-3">Значение <InlineFormulaView>{{ props.var }} \approx {{ value }} \pm {{ error }}</InlineFormulaView></p>
  </div>
</template>