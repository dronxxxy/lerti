<script setup lang="ts">
  import { MAX_FRACTION_DIGITS } from '@/shared/constants';
  import { Button, InputNumber, InputGroup, InputGroupAddon } from 'primevue';
  import { computed, onMounted, ref } from 'vue';

  const model = defineModel<number[]>({
    default: [0, 0, 0, 0, 0]
  })

  const initialValue = ref<number[]>([]);
  onMounted(() => initialValue.value = [...model.value])

  const rowSize = 5
  const rowsCount = computed(() => Math.ceil(model.value.length / rowSize))
  const lastColumnsCount = computed(() => model.value.length % rowSize != 0 ?
    model.value.length % rowSize :
    rowSize)

  const clear = () => {
    model.value = initialValue.value
  }

  const appendOne = () => {
    model.value = [...model.value, 0]
  }

  const appendRow = () => {
    const count = lastColumnsCount.value == rowSize ?  rowSize : rowSize - lastColumnsCount.value;
    model.value = [...model.value, ...(new Array(count).map(_ => 0))]
  }
</script>

<template>
  <div class="flex flex-col gap-2 w-[100%]">
    <InputGroup
      v-for="rowId in rowsCount"
      :key="rowId"
    >
      <template
        v-for="columnId in rowSize"
        :key="columnId"
      >
        <InputNumber
          v-if="rowId != rowsCount || columnId <= lastColumnsCount"
          v-model="model[(rowId - 1) * rowSize + (columnId - 1)]"
          placeholder="0"
          :max-fraction-digits="MAX_FRACTION_DIGITS"
        />
        <InputGroupAddon v-else class="sample-cell"> &ndash; </InputGroupAddon>
      </template>
    </InputGroup>
    <div class="flex flex-row gap-2">
      <div class="flex-1"></div>
      <div class="shrink-0">
        <InputGroup>
          <Button size="small" severity="info" outlined @click="appendOne">Добавить</Button>
          <Button size="small" severity="warn" outlined @click="appendRow">Добавить {{ rowSize }}</Button>
          <Button size="small" severity="danger" outlined @click="clear">Очистить</Button>
        </InputGroup>
      </div>
      <div class="flex-1"></div>
    </div>
  </div>
</template>

<style scoped>
.sample-cell {
  width: calc(100% / v-bind(rowSize))
}
</style>