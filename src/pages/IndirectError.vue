<!-- IndirectError.vue -->
<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card, DataTable, Column, InputText, InputNumber, Button } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import useIndirectError from '@/models/indirectError';
  import { Decimal } from 'decimal.js';
  import { ref } from 'vue';

  const service = useIndirectError(); 
  
  const tableLengthInput = ref<string>(service.table.getLength().toString());

  const updateTableLength = () => {
    const val = parseInt(tableLengthInput.value);
    if (!isNaN(val) && val >= 1) {
      service.table.setLength(val);
    }
  };

  const onValueUpdate = (varIndex: number, sampleIndex: number, newVal: string) => {
    const val = Number(newVal);
    if (isNaN(val)) return;
    service.table.variables[varIndex]!.values[sampleIndex] = new Decimal(val);
  };

  const onErrorUpdate = (varIndex: number, newVal: string) => {
    const val = Number(newVal);
    if (isNaN(val)) return;
    service.table.variables[varIndex]!.error = new Decimal(val);
  };
</script>

<template>
  <CardList>
    <Card>
      <template #title>
        Формула
      </template>
      <template #content>
        <div class="flex flex-col items-center gap-4">
          <FormulaInput
            v-model="service.formula.value"
            class="w-[50%]"
          />
          <div v-if="service.error" class="text-red-500 text-sm">
            {{ service.error.value }}
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>
        Данные переменных
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <label>Длина выборки:</label>
            <InputText 
              v-model="tableLengthInput" 
              @blur="updateTableLength"
              @keyup.enter="updateTableLength"
            />
          </div>

          <DataTable 
            :value="service.table.variables" 
            scrollable
            scrollDirection="horizontal"
          >
            <Column field="name" header="Переменная">
              <template #body="{ data, index }">
                {{ data.name }} 
              </template>
            </Column>

            <Column field="error" header="Погрешность">
              <template #body="{ data, index }">
                <InputText 
                  class="w-[100px]"
                  :modelValue="data.error"
                  @update:modelValue="(val) => onErrorUpdate(index, val ?? '')"
                />
              </template>
            </Column>

            <Column 
              v-for="i in service.table.getLength()" 
              :key="i"
              :header="`№${i}`"
            >
              <template #body="{ data, index: varIndex }">
                <InputText 
                  class="w-[100px]"
                  :modelValue="data.values[i - 1]"
                  @update:modelValue="(val) => onValueUpdate(varIndex, i - 1, val ?? '')"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>
  </CardList>
</template>
