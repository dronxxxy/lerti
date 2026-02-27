<script setup lang="ts">
  import Decimal from 'decimal.js';
  import { Button, InputGroup } from 'primevue';
  import { computed, onMounted, ref } from 'vue';
  import Sample from './Sample.vue';
  import { SAMPLE_INPUT_WIDTH } from '@/shared/constants';

  const model = defineModel<Decimal[]>({
    default: [0, 0, 0, 0, 0].map((e) => new Decimal(e))
  })

  const initialValue = ref<Decimal[]>([]);
  onMounted(() => initialValue.value = [...model.value])

  const rowSize = SAMPLE_INPUT_WIDTH
  const lastColumnsCount = computed(() => model.value.length % rowSize != 0 ?
    model.value.length % rowSize :
    rowSize)

  const clear = () => model.value = initialValue.value
  const appendOne = () => model.value = [...model.value, new Decimal(0)]
  const appendRow = () => {
    const count = lastColumnsCount.value == rowSize ?  rowSize : rowSize - lastColumnsCount.value;
    model.value = [...model.value, ...(new Array(count).fill(0))]
  }
</script>

<template>
  <div class="flex flex-col gap-2 w-[100%]">
    <Sample v-model="model" />
    <div class="flex flex-row gap-2">
      <div class="flex-1"></div>
      <div class="shrink-0">
        <InputGroup>
          <Button size="small" severity="info" outlined @click="appendOne">Добавить</Button>
          <Button size="small" severity="warn" outlined @click="appendRow">Добавить строку</Button>
          <Button size="small" severity="danger" outlined @click="clear">Очистить</Button>
        </InputGroup>
      </div>
      <div class="flex-1"></div>
    </div>
  </div>
</template>
