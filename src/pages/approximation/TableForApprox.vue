<script setup lang="ts">
  import { MAX_FRACTION_DIGITS } from '@/shared/constants';
  import { Button, InputNumber, InputGroup, InputGroupAddon, IftaLabel  } from 'primevue';
  import { computed, onMounted, ref } from 'vue';

  const props = defineProps<{
    type?: 'x' | 'y' | 'both'
  }>()

  const xModel = defineModel<number[]>('x', {
    default: [0, 0, 0, 0, 0]
  })

  const yModel = defineModel<number[]>('y', {
    default: [0, 0, 0, 0, 0]
  })

  const initialXValue = ref<number[]>([]);
  const initialYValue = ref<number[]>([]);
  
  onMounted(() => {
    initialXValue.value = [...xModel.value]
    initialYValue.value = [...yModel.value]
  })

  const rowSize = 5

  const rowsCount = computed(() => {
    const xRows = Math.ceil(xModel.value.length / rowSize)
    const yRows = Math.ceil(yModel.value.length / rowSize)
    return Math.max(xRows, yRows)
  })
  

  const shouldShowXColumn = (rowId: number, columnId: number) => {
    const index = (rowId - 1) * rowSize + (columnId - 1)
    return index < xModel.value.length
  }


  const shouldShowYColumn = (rowId: number, columnId: number) => {
    const index = (rowId - 1) * rowSize + (columnId - 1)
    return index < yModel.value.length
  }


  const getIndex = (rowId: number, columnId: number) => {
    return (rowId - 1) * rowSize + (columnId - 1)
  }


  const clear = () => {
    xModel.value = [...initialXValue.value]
    yModel.value = [...initialYValue.value]
  }

  const appendOne = () => {
    xModel.value = [...xModel.value, 0]
    yModel.value = [...yModel.value, 0]
  }

  const appendRow = () => {
    xModel.value = [...xModel.value, 0, 0, 0, 0, 0]
    yModel.value = [...yModel.value, 0, 0, 0, 0, 0]
  }

  const showX = computed(() => props.type === 'x' || props.type === 'both')
  
  const showY = computed(() => props.type === 'y' || props.type === 'both')
</script>

<template>
  <div class="flex flex-col gap-2 w-[100%]">
    <div class="flex flex-row gap-2 mb-1" v-if="showX && showY">
      <div class="w-1/2 text-center text-sm font-semibold text-gray-700">X значения</div>
      <div class="w-1/2 text-center text-sm font-semibold text-gray-700">Y значения</div>
    </div>

    <div
      v-for="rowId in rowsCount"
      :key="rowId"
      class="flex flex-row gap-2"
    >
      <div v-if="showX" class="flex-1">
        <InputGroup>
          <template
            v-for="columnId in rowSize"
            :key="columnId"
          >
            <IftaLabel v-if="shouldShowXColumn(rowId, columnId)">
              <InputNumber
                v-model="xModel[getIndex(rowId, columnId)]"
                placeholder="0"
                :max-fraction-digits="MAX_FRACTION_DIGITS"
              />
              <label>x<sub>{{ getIndex(rowId, columnId) }}</sub></label>
            </IftaLabel>
            <InputGroupAddon v-else class="sample-cell"> &ndash; </InputGroupAddon>
          </template>
        </InputGroup>
      </div>

      <div v-if="showY" class="flex-1">
        <InputGroup>
          <template
            v-for="columnId in rowSize"
            :key="columnId"
          >
            <IftaLabel v-if="shouldShowYColumn(rowId, columnId)">
              <InputNumber
                v-model="yModel[getIndex(rowId, columnId)]"
                placeholder="0"
                :max-fraction-digits="MAX_FRACTION_DIGITS"
              />
              <label>y<sub>{{ getIndex(rowId, columnId) }}</sub></label>
            </IftaLabel>
            <InputGroupAddon v-else class="sample-cell"> &ndash; </InputGroupAddon>
          </template>
        </InputGroup>
      </div>
    </div>

    <div class="flex flex-row gap-2 mt-2">
      <div class="flex-1"></div>
      <div class="shrink-0">
        <InputGroup>
          <Button size="small" severity="info" outlined @click="appendOne">Добавить элемент</Button>
          <Button size="small" severity="warn" outlined @click="appendRow">Добавить строку</Button>
          <Button size="small" severity="danger" outlined @click="clear">Сбросить</Button>
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