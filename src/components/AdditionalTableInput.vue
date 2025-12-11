<script setup lang="ts">
  import { InputNumber, Button, FloatLabel, InputGroup, InputGroupAddon } from 'primevue';
  import { ref } from 'vue';

  const model = defineModel<Record<number, number>>({
    default: {}
  })

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
  <div class="flex flex-col items-stretch">
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
        <label>Длина выборки (N)</label>
      </FloatLabel>
      <Button @click="add">Добавить</Button>
    </InputGroup>
  </div>
</template>