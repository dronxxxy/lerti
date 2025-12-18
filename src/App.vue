<script setup lang="ts">
  import useSimpleError from './models/simpleError';
  import SimpleErrorResultView from './components/SimpleErrorResultView.vue';
  import Sample from './components/Sample.vue';
  import { Button, Card, InputNumber, Accordion, AccordionHeader, AccordionPanel, AccordionContent, Badge, InputGroup, InputGroupAddon } from 'primevue'
  import { MAX_FRACTION_DIGITS } from './shared/constants';
  import { ref } from 'vue';
  import AdditionalTableInput from './components/AdditionalTableInput.vue';
  import { U_TABLE_95 } from './shared/algorithm/cleanMisses';
  import { T_TABLE_95 } from './shared/algorithm/sample';
  import DocsButton from './components/DocsButton.vue';

  const service = useSimpleError()

  const ADDITIONAL_US = "0"
  const ADDITIONAL_TS = "1"
  const openedTabs = ref<string[]>([])
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="lg:w-3/5 sm:w-[100%] p-5 flex flex-col gap-4">
      <Card>
        <template #title>
          <div class="flex flex-row justify-between">
            Выборка
            <DocsButton :page="14" />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-5 items-stretch pt-2">
            <Sample v-model="service.values.value"/>

            <div class="flex flex-row items-center gap-2">
              <InputGroup>
                <InputGroupAddon>Приборная погрешность &theta;<sub>x</sub></InputGroupAddon>
                <InputNumber
                  v-model="service.machineError.value"
                  :max-fraction-digits="MAX_FRACTION_DIGITS"
                />
              </InputGroup>
              <DocsButton :page="26" />
            </div>
            <Accordion v-model="openedTabs" multiple>
              <AccordionPanel :value="ADDITIONAL_US">
                <AccordionHeader>
                  <div class="flex flex-row items-center gap-2">
                    <span>Дополнительные значения u<sub>P,N</sub></span>
                    <DocsButton :page="25" />
                  </div>
                </AccordionHeader>
                <AccordionContent>
                  <p class="mb-2">
                    Иногда требуется убрать грубые промахи из выборки нестандартного размера. 
                    В таких случаях надо явно указать значения u для данных выбросов из выборки
                  </p>
                  <AdditionalTableInput v-model="service.additionalUs.value" :default-table="U_TABLE_95" />
                </AccordionContent>
              </AccordionPanel>
              <AccordionPanel :value="ADDITIONAL_TS">
                <AccordionHeader>
                  <div class="flex flex-row items-center gap-2">
                    <span>Дополнительные значения t<sub>P,N</sub></span>
                    <DocsButton :page="21" />
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
    </div>
  </div>
</template>

<style scoped></style>
