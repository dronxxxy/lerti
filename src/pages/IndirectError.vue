<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card, DataTable, Column, InputText, Button, AccordionPanel, AccordionHeader, Accordion, AccordionContent } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import useIndirectError from '@/models/indirectError';
  import { computed, ref } from 'vue';
  import { AsciiFormulaWriter } from '@/shared/formulas/writers/ascii';
  import FormulaView from '@/components/FormulaView.vue';
import { roundErrorString, roundValueString } from '@/shared/algorithm/rounding';
import ProcessingInputText from '@/components/ProcessingInputText.vue';

  const service = useIndirectError(); 
  
  const tableLengthInput = ref<string>(service.table.getLength().toString());

  const updateTableLength = () => {
    const val = parseInt(tableLengthInput.value);
    if (!isNaN(val) && val >= 1) {
      service.table.setLength(val);
    }
  };

  const result = computed(() => {
    const result = service.result.value;
    if (!result) return null;
    return {
      derivatives: Object.entries(result.partials)
        .map(([varName, partial]) => `(df)/(d${varName}) = ${ partial?.toString(new AsciiFormulaWriter()) ?? 0 }`),
      samples: result.samples.map((sample) => ({
        result: `f = ${sample.result.toFixed(2)}`,
        error: `theta = sqrt(${
              sample.derivatives
                .map((derivative, i) => `(${derivative.toFixed(2)} * ${result.errors[i]!.toFixed(2)}) ^ 2`)
                .join(' + ')
            }) = ${sample.error.toFixed(2)}`
      })),
      result: `f = (${result.samples.map((sample) => sample.result.toFixed(2)).join('+')})/${result.samples.length} = ${result.average.toFixed(2)}`, 
      error: `theta = sqrt(${result.samples.map((sample) => `${sample.error.toFixed(2)} ^ 2`).join('+')})/${result.samples.length} = ${result.error.toFixed(2)}`,
      errorValue: roundErrorString(result.error),
      resultValue: roundValueString(result.average, result.error),
    };
  })

  const DERIVATIVES = "0"
  const SAMPLES = "1"
  const RESULTS = "2"
  const openedTabs = ref<string[]>([])
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

          <div class="flex items-center gap-2 w-[80%]">
            <label>Длина выборки:</label>
            <InputText 
              class="flex-grow"
              v-model="tableLengthInput" 
              @blur="updateTableLength"
              @keyup.enter="updateTableLength"
            />
          </div>

          <DataTable 
            v-if="service.table.variables.length > 0"
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
                <ProcessingInputText 
                  class="w-[100px]"
                  :value="data.error.toString()"
                  @update="(val) => service.table.setVariableError(data.name, val ?? '')"
                />
              </template>
            </Column>

            <Column 
              v-for="i in service.table.getLength()" 
              :key="i"
              :header="`№${i}`"
            >
              <template #body="{ data }">
                <ProcessingInputText
                  class="w-[100px]"
                  :value="data.values[i - 1].toString()"
                  @update="(val) => service.table.setVariableValue(data.name, i - 1, val ?? '')"
                />
              </template>
            </Column>
          </DataTable>
          <Button :disabled="!service.canProcess.value" class="w-[80%]" @click="service.process">Посчитать</Button>
        </div>
      </template>
    </Card>

    <Card v-if="result">
      <template #title>
        Результат
      </template>

      <template #content>
        <Accordion v-model="openedTabs" multiple>
          <AccordionPanel :value="DERIVATIVES">
            <AccordionHeader>Производные</AccordionHeader>
            <AccordionContent>
              <FormulaView v-for="derivative of result.derivatives" :value="derivative" />
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel :value="SAMPLES">
            <AccordionHeader>Вычисление выборок</AccordionHeader>
            <AccordionContent>

              <Accordion multiple>
                <template v-for="(sample, sampleId) of result.samples">
                  <AccordionPanel :value="sampleId">
                    <AccordionHeader>Выборка №{{ sampleId + 1 }}</AccordionHeader>
                    <AccordionContent>
                      <FormulaView :value="sample.result" />
                      <FormulaView :value="sample.error" />
                    </AccordionContent>
                  </AccordionPanel>
                </template>
              </Accordion>

            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel :value="RESULTS">
            <AccordionHeader>Вычисление результата</AccordionHeader>
            <AccordionContent>
              <FormulaView :value="result.result" />
              <FormulaView :value="result.error" />
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
        <div class="p-3 text-center">
          <p class="text-2xl mt-3">Значение x &approx; <b>{{ result.resultValue }} &plusmn; {{ result.errorValue }}</b></p>
        </div>
      </template>
    </Card>
  </CardList>
</template>
