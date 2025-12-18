<script setup lang="ts">
  import type Decimal from 'decimal.js';
  import { InputNumber, Button, FloatLabel, InputGroup, InputGroupAddon, Accordion, AccordionPanel, AccordionHeader, AccordionContent, DataTable, Column } from 'primevue';
  import { ref } from 'vue';
  import DocsButton from './DocsButton.vue';

  const model = defineModel<Record<number, number>>({
    default: {}
  })

  const props = defineProps<{
    defaultTable: Record<number, Decimal>,
  }>()

  const length = ref<number>(6)

  const add = () => {
    model.value = { ...model.value, [length.value]: 0 };
    length.value += 1;
  }

  const deleteN = (n: number) => {
    const {[n]: _, ...copy} = model.value;
    model.value = copy;
  }
</script>

<template>
  <Accordion multiple>
    <AccordionPanel value="0">
      <AccordionHeader>
        <div class="flex flex-row items-center gap-2">
          <span>Стандартные значения при P = 95%</span>
          <DocsButton :page="75" />
        </div>
      </AccordionHeader>
      <AccordionContent>
        <DataTable :value="Object.entries(props.defaultTable).map(([n, u]) => ({ n, u }))">
          <Column field="n" header="Длина выборки N"></Column>
          <Column field="u" header="Значение"></Column>
        </DataTable>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
  <div class="flex flex-col items-stretch mt-2">
    <InputGroup class="mb-2" v-for="n in Object.keys(model)">
      <InputGroupAddon>N = {{ n }}</InputGroupAddon>
      <InputNumber
        v-model="model[Number(n)]"
        :max-fraction-digits="2"
      />
      <Button severity="danger" @click="() => deleteN(Number(n))">Удалить</Button>
    </InputGroup>
    <InputGroup class="mt-5">
      <FloatLabel class="flex-grow">
        <InputNumber v-model="length" class="w-[100%]"/>
        <label>Длина выборки N</label>
      </FloatLabel>
      <Button @click="add">Добавить</Button>
    </InputGroup>
  </div>
</template>