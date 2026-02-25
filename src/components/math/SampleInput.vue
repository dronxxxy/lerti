<script setup lang="ts">
  import Decimal from 'decimal.js';
  import { InputGroup, InputGroupAddon, IftaLabel  } from 'primevue';
  import { computed, onMounted, ref } from 'vue';
  import InputDecimal from '../basics/InputDecimal.vue';
  import { SAMPLE_INPUT_WIDTH } from '@/shared/constants';

  const model = defineModel<Decimal[]>({
    default: [0, 0, 0, 0, 0].map((e) => new Decimal(e))
  })

  const initialValue = ref<Decimal[]>([]);
  onMounted(() => initialValue.value = [...model.value])

  const rowSize = SAMPLE_INPUT_WIDTH
  const rowsCount = computed(() => Math.ceil(model.value.length / rowSize))
  const lastColumnsCount = computed(() => model.value.length % rowSize != 0 ?
    model.value.length % rowSize :
    rowSize)
</script>

<template>
  <InputGroup
    v-for="rowId in rowsCount"
    :key="rowId"
  >
    <template
      v-for="columnId in rowSize"
      :key="columnId"
    >
      <IftaLabel v-if="rowId != rowsCount || columnId <= lastColumnsCount">
        <InputDecimal
          v-model="model[(rowId - 1) * rowSize + (columnId - 1)]!"
          placeholder="0"
        />
        <label>Элемент x<sub>{{(rowId - 1) * rowSize + (columnId - 1)}}</sub></label>
      </IftaLabel>
      <InputGroupAddon v-else class="sample-cell"> &ndash; </InputGroupAddon>
    </template>
  </InputGroup>
</template>

<style scoped>
  .sample-cell {
    width: calc(100% / v-bind(rowSize))
  }
</style>