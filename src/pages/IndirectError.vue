<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card, DataTable, Column, InputText, Button } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import useIndirectError from '@/models/indirectError';
  import { Decimal } from 'decimal.js';
  import { computed, ref } from 'vue';
import { AsciiFormulaWriter } from '@/shared/formulas/writers/ascii';
import FormulaView from '@/components/FormulaView.vue';

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

  const result = computed(() => {
    const result = service.result.value;
    if (!result) return null;
    return {
      derivatives: Object.entries(result.partials)
        .map(([varName, partial]) => `(df)/(d${varName}) = ${ partial?.toString(new AsciiFormulaWriter()) ?? 0 }`),
      samples: result.samples.map((sample) => ({
        result: `f = ${sample.result}`,
        error: `theta = sqrt(${
              sample.derivatives
                .map((derivative, i) => `(${derivative.toFixed(2)} * ${result.errors[i]!.toFixed(2)}) ^ 2`)
                .join(' + ')
            }) = ${sample.error.toFixed(2)}`
      })),
      result: `f = (${result.samples.map((sample) => sample.result.toFixed(2)).join('+')})/${result.samples.length} = ${result.average.toFixed(2)}`, 
      error: `theta = sqrt(${result.samples.map((sample) => `${sample.error.toFixed(2)} ^ 2`).join('+')})/${result.samples.length} = ${result.error.toFixed(2)}`
    };
  })
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

    <Card v-if="result">
      <template #title>
        Результат
      </template>

      <template #content>
        <p><b>Производные:</b></p>
        <FormulaView v-for="derivative of result.derivatives" :value="derivative" />

        <p><b>Значения по выборкам:</b></p>
        <div v-for="(sample, sampleId) of result.samples">
          <p>----- Выборка №{{ sampleId + 1 }}:</p>
          <FormulaView :value="sample.result" />
          <FormulaView :value="sample.error" />
        </div>

        <p><b>Итоговые значения:</b></p>
        <FormulaView :value="result.result" />
        <FormulaView :value="result.error" />
      </template>
    </Card>
  </CardList>
</template>
