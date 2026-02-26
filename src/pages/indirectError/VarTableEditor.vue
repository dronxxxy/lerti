<script setup lang="ts">
  import InputDecimal from '@/components/basics/InputDecimal.vue';
import FormulaView from '@/components/math/FormulaView.vue';
import type useVarTableInput from '@/composables/varTableInput';
import { Column, DataTable, InputGroup, InputGroupAddon, InputNumber } from 'primevue';

  const props = defineProps<{
    table: ReturnType<typeof useVarTableInput>
  }>()
</script>

<template>
  <InputGroup>
    <InputGroupAddon>Длина выборки:</InputGroupAddon>
    <InputNumber :modelValue="table.length.value" @update:modelValue="table.setLength" />
  </InputGroup>

  <DataTable
    v-if="table.variables.length > 0"
    class="w-[100%]"
    :value="table.variables" 
    scrollable
    scrollDirection="horizontal"
  >
    <Column field="name" header="Переменная" class="w-[100px]">
      <template #body="{ data }">
        <FormulaView :value="data.name" />
      </template>
    </Column>

    <Column field="error" header="Погрешность">
      <template #body="{ data }">
        <InputDecimal
          v-model="data.error"
          class="w-[100px]"
        />
      </template>
    </Column>

    <Column 
      v-for="i in table.length.value" 
      :key="i"
      :header="`№${i}`"
    >
      <template #body="{ data }">
        <InputDecimal
          v-model="data.values[i - 1]"
          class="w-[100px]"
        />
      </template>
    </Column>
  </DataTable>
</template>