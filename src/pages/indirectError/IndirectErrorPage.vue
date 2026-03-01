<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Button, AccordionPanel, AccordionHeader, Accordion, AccordionContent, InputGroup, InputGroupAddon, InputNumber, Badge, TabStyle } from 'primevue';
  import FormulaInput from '@/components/math/FormulaInput.vue';
  import useIndirectErrorCalculator from '@/composables/indirectErrorCalculator';
  import { computed } from 'vue';
  import FormulaView from '@/components/math/FormulaView.vue';
  import ContentCard from '@/components/basics/ContentCard.vue';
  import ErrorValue from '@/components/math/ErrorValue.vue';
  import VarTableEditor from './VarTableEditor.vue';
  import { VariableFormula } from '@/shared/math/formulas/impl/variable';

  const service = useIndirectErrorCalculator(); 
  
  const result = computed(() => {
    const result = service.result.value;
    if (!result) return null;
    return {
      derivatives: Object.entries(result.partials)
        .map(([varName, partial]) => `\\frac {df} {d${new VariableFormula(varName).toLatex()}} = ${ partial?.toLatex() ?? 0 }`),
      samples: result.samples.map((sample) => ({
        result: `f = ${sample.result.toFixed(2)}`,
        error: `\\theta = \\sqrt {${
              sample.derivatives
                .map((derivative, i) => `\\left( ${derivative.toFixed(2)} \\cdot ${result.errors[i]!.toFixed(2)} \\right) ^ 2`)
                .join(' + ')
            }} = ${sample.error.toFixed(2)}`
      })),
      result: `f = \\frac { ${result.samples.map((sample) => sample.result.toFixed(2)).join('+')} } ${result.samples.length} = ${result.average.toFixed(2)}`, 
      error: `\\theta = \\frac \\sqrt { ${result.samples.map((sample) => `${sample.error.toFixed(2)} ^ 2`).join('+')} } ${result.samples.length} = ${result.error.toFixed(2)}`,
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
                <p><b>Выборка №{{ sampleId + 1 }}</b>:
                  <FormulaView :value="sample.result" />
                  <FormulaView :value="sample.error" />
                </p>
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
