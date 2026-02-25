<script setup lang="ts">
  import useSimpleError from '@/composables/simpleError';
  import SimpleErrorResultView from './SimpleErrorResultView.vue';
  import { Button, Card, Accordion, AccordionHeader, AccordionPanel, AccordionContent, Badge, InputGroup, InputGroupAddon } from 'primevue'
  import { MAX_FRACTION_DIGITS } from '@/shared/constants';
  import AdditionalTableInput from './AdditionalTableInput.vue';
  import { U_TABLE_95 } from '@/shared/math/simpleError/cleanMisses';
  import { T_TABLE_95 } from '@/shared/math/sample';
  import DocsButton from '@/components/basics/DocsButton.vue';
  import CardList from '@/components/CardList.vue';
  import SampleInput from '@/components/math/SampleInput.vue';
  import InputDecimal from '@/components/basics/InputDecimal.vue';

  const service = useSimpleError()
</script>

<template>
  <CardList>
    <Card>
      <template #title>
        <div class="flex flex-row justify-between">
          Выборка
          <DocsButton :page="14" module="2.2." />
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-5 items-stretch pt-2">
          <SampleInput v-model="service.values.value"/>

          <div class="flex flex-row items-center gap-2">
            <InputGroup>
              <InputGroupAddon>Приборная погрешность &theta;<sub>x</sub></InputGroupAddon>
              <InputDecimal
                v-model="service.machineError.value"
                :max-fraction-digits="MAX_FRACTION_DIGITS"
              />
            </InputGroup>
            <DocsButton :page="26" module="2.8." />
          </div>
          <Accordion multiple>
            <AccordionPanel value="ADDITIONAL_US">
              <AccordionHeader>
                <div class="flex flex-row items-center gap-2">
                  <span>Дополнительные значения u<sub>P,N</sub></span>
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
                  <span>Дополнительные значения t<sub>P,N</sub></span>
                  <DocsButton :page="21" module="2.6." />
                </div>
              </AccordionHeader>
              <AccordionContent>
                <AdditionalTableInput v-model="service.additionalTs.value" :default-table="T_TABLE_95" />
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
          <Button severity="success" raised @click="service.process()">Вычислить</Button>
        </div>
      </template>
    </Card> 
    <Card v-if="service.result.value || service.error.value">
      <template #title>
        <Badge size="xlarge" :severity="service.error.value ? 'danger' : 'success'">
          {{ service.error.value ? service.error.value.title : "Расчет" }}
        </Badge>
      </template>
      <template #content>
        <SimpleErrorResultView 
          v-if="service.result.value"
          :result="service.result.value"
        />
        <p v-if="service.error.value">{{ service.error.value.description }}</p>
      </template>
    </Card> 
  </CardList>
</template>

