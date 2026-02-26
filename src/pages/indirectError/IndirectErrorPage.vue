<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { DataTable, Column, Button, AccordionPanel, AccordionHeader, Accordion, AccordionContent, InputGroup, InputGroupAddon, InputNumber, Badge, TabStyle } from 'primevue';
  import FormulaInput from '@/components/math/FormulaInput.vue';
  import useIndirectErrorCalculator from '@/composables/indirectErrorCalculator';
  import { computed } from 'vue';
  import { AsciiFormulaWriter } from '@/shared/math/formulas/writers/ascii';
  import FormulaView from '@/components/math/FormulaView.vue';
  import ContentCard from '@/components/basics/ContentCard.vue';
  import ErrorValue from '@/components/math/ErrorValue.vue';
  import InputDecimal from '@/components/basics/InputDecimal.vue';
import VarTableEditor from './VarTableEditor.vue';

  const service = useIndirectErrorCalculator(); 
  
  const result = computed(() => {
    const result = service.result.value;
    if (!result) return null;
    return {
      derivatives: Object.entries(result.partials)
        .map(([varName, partial]) => `(df)/(d ${varName}) = ${ partial?.toString(new AsciiFormulaWriter()) ?? 0 }`),
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
      errorValue: result.error,
      resultValue: result.average,
    };
  })
</script>

<template>
  <CardList>
    <ContentCard title="Данные">
      <FormulaInput
        v-model="service.formula.value"
        class="w-[50%]"
      />
      <Badge v-if="service.error.value" severity="danger">
        {{ service.error.value.description }}
      </Badge>

      <VarTableEditor :table="service.table" />

      <Button :disabled="!service.canProcess.value" @click="service.process">Посчитать</Button>
    </ContentCard>

    <ContentCard v-if="result" title="Результат">
      <Accordion class="w-[100%]" multiple>
        <AccordionPanel value="DERIVATIVES">
          <AccordionHeader>Производные</AccordionHeader>
          <AccordionContent>
            <FormulaView v-for="derivative of result.derivatives" :value="derivative" />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="SAMPLES">
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
        <AccordionPanel value="RESULTS">
          <AccordionHeader>Вычисление результата</AccordionHeader>
          <AccordionContent>
            <FormulaView :value="result.result" />
            <FormulaView :value="result.error" />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <ErrorValue :value="result.resultValue" :error="result.errorValue" var="f" />
    </ContentCard>
  </CardList>
</template>
