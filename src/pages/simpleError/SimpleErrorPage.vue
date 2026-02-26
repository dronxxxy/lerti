<script setup lang="ts">
  import useSimpleErrorCalculator from '@/composables/simpleErrorCalculator';
  import SimpleErrorResultView from './SimpleErrorResultView.vue';
  import { Button, Accordion, AccordionHeader, AccordionPanel, AccordionContent, Badge, InputGroup, InputGroupAddon } from 'primevue'
  import { MAX_FRACTION_DIGITS } from '@/shared/constants';
  import AdditionalTableInput from './AdditionalTableInput.vue';
  import { U_TABLE_95 } from '@/shared/math/simpleError/cleanMisses';
  import { T_TABLE_95 } from '@/shared/math/sample';
  import DocsButton from '@/components/basics/DocsButton.vue';
  import CardList from '@/components/CardList.vue';
  import SampleInput from '@/components/math/SampleInput.vue';
  import InputDecimal from '@/components/basics/InputDecimal.vue';
  import ContentCard from '@/components/basics/ContentCard.vue';
  import InlineFormulaView from '@/components/math/InlineFormulaView.vue';

  const service = useSimpleErrorCalculator()
</script>

<template>
  <CardList>
    <ContentCard
      title="Выборка"
      :docs="{ page: 14, module: '2.2.' }"
    >
      <SampleInput v-model="service.values.value"/>

      <div class="flex flex-row items-center w-[100%] gap-2">
        <InputGroup>
          <InputGroupAddon>
            <p>
              Приборная погрешность
              <InlineFormulaView>\theta_x</InlineFormulaView>
            </p>
          </InputGroupAddon>
          <InputDecimal
            v-model="service.machineError.value"
            :max-fraction-digits="MAX_FRACTION_DIGITS"
          />
        </InputGroup>
        <DocsButton :page="26" module="2.8." />
      </div>
      <Accordion class="w-[100%]" multiple>
        <AccordionPanel value="ADDITIONAL_US">
          <AccordionHeader>
            <div class="flex flex-row items-center gap-2">
              <span>Дополнительные значения <InlineFormulaView>u_{P,N}</InlineFormulaView></span>
              <DocsButton :page="25" module="2.7." />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <AdditionalTableInput v-model="service.additionalUs.value" :default-table="U_TABLE_95" />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="ADDITIONAL_TS">
          <AccordionHeader>
            <div class="flex flex-row items-center gap-2">
              <span>Дополнительные значения <InlineFormulaView>t_{P,N}</InlineFormulaView></span>
              <DocsButton :page="21" module="2.6." />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <AdditionalTableInput v-model="service.additionalTs.value" :default-table="T_TABLE_95" />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <Button severity="success" raised @click="service.process()">Вычислить</Button>
    </ContentCard> 
    <ContentCard
      v-if="service.result.value || service.error.value"
      :title="service.error.value ? service.error.value.title : 'Расчет'"
    >
      <SimpleErrorResultView 
        v-if="service.result.value"
        :result="service.result.value"
      />
      <p v-if="service.error.value">{{ service.error.value.description }}</p>
    </ContentCard> 
  </CardList>
</template>

