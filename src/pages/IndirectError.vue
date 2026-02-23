<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card, DataTable, Column, InputText, Button } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import useIndirectError from '@/models/indirectError';
  import { Decimal } from 'decimal.js';
  import { computed, ref } from 'vue';

  const service = useIndirectError(); 
  
  const tableLengthInput = ref<string>(service.table.getLength().toString());

  const updateTableLength = () => {
    const val = parseInt(tableLengthInput.value);
    if (!isNaN(val) && val >= 1) {
      service.table.setLength(val);
    }
  };

  const onValueUpdate = (varIndex: number, sampleIndex: number, newVal: string) => {
    let val = Number(newVal);
    if (isNaN(val)) val = 0;
    service.table.variables[varIndex]!.values[sampleIndex] = new Decimal(val);
  };

  const onErrorUpdate = (varIndex: number, newVal: string) => {
    let val = Number(newVal);
    if (isNaN(val)) val = 0;
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
        <div class="flex flex-col items-center gap-4 text-center">
          <FormulaInput
            v-model="service.formula.value"
            class="w-[50%]"
          />
          <div v-if="service.error" class="text-red-500 text-sm">
            {{ service.error.value }}
          </div>

          <div class="flex items-center gap-2 w-[100%]">
            <label>Длина выборки:</label>
            <InputText 
              v-model="tableLengthInput" 
              @blur="updateTableLength"
              @keyup.enter="updateTableLength"
            />
          </div>

          <DataTable 
            class="w-[100%]"
            :value="service.table.variables" 
            scrollable
            scrollDirection="horizontal"
          >
            <Column field="name" header="Переменная">
              <template #body="{ data }">
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
                  :modelValue="data.values[i - 1] ?? 0"
                  @update:modelValue="(val) => onValueUpdate(varIndex, i - 1, val ?? '')"
                />
              </template>
            </Column>
          </DataTable>
          <Button class="w-[80%]" @click="service.process">Посчитать</Button>
        </div>
      </template>
    </Card>

    <Card>
      <template #content>
        <p>{{ JSON.stringify(service.result.value) }}</p>
      </template>
    </Card>
  </CardList>
</template>
