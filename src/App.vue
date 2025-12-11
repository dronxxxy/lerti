<script setup lang="ts">
  import useSimpleError from './models/simpleError';
  import SimpleErrorResultView from './components/SimpleErrorResultView.vue';
  import Sample from './components/Sample.vue';
  import { Button, Card, InputNumber, FloatLabel, Accordion, AccordionHeader, AccordionPanel, AccordionContent, Badge } from 'primevue'
  import { MAX_FRACTION_DIGITS } from './shared/constants';
  import { ref } from 'vue';
  import AdditionalTableInput from './components/AdditionalTableInput.vue';

  const service = useSimpleError()

  const ADDITIONAL_US = "0"
  const ADDITIONAL_TS = "1"
  const openedTabs = ref<string[]>([])
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="w-3/5 p-5 flex flex-col gap-4">
      <Card>
        <template #title>Выборка</template>
        <template #content>
          <div class="flex flex-col gap-5 items-stretch pt-2">
            <div class="flex flex-row gap-4">
              <Sample v-model="service.values.value"/>
              <FloatLabel>
                <InputNumber
                  v-model="service.machineError.value"
                  :max-fraction-digits="MAX_FRACTION_DIGITS"
                />
                <label>Машинная ошибка</label>
              </FloatLabel>
            </div>
            <Accordion v-model="openedTabs" multiple>
              <AccordionPanel :value="ADDITIONAL_US">
                <AccordionHeader>Дополнительные значения u</AccordionHeader>
                <AccordionContent>
                  <p class="mb-2">
                    Иногда требуется убрать грубые промахи из выборки нестандартного размера. 
                    В таких случаях надо явно указать значения u для данных выбросов из выборки
                  </p>

                  <AdditionalTableInput v-model="service.additionalUs.value" />
                </AccordionContent>
              </AccordionPanel>
              <AccordionPanel :value="ADDITIONAL_TS">
                <AccordionHeader>Дополнительные значения t</AccordionHeader>
                <AccordionContent>
                  <p class="mb-2">
                    Когда требуется посчитать погрешность по СКО из выборки нестандартного размера
                    надо явно указать значения t для данной выборки
                  </p>

                  <AdditionalTableInput v-model="service.additionalTs.value" />
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
