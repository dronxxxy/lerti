<script setup lang="ts">
  import useSimpleError from './models/simpleError';
  import SimpleErrorResultView from './components/SimpleErrorResultView.vue';
  import Sample from './components/Sample.vue';
  import { Button, Card } from 'primevue';

  const service = useSimpleError()
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="w-3/5 p-5 flex flex-col gap-4">
      <Card>
        <template #title>Выборка</template>
        <template #content>
          <div class="flex flex-row gap-2 items-center">
            Выборка: <Sample :values="service.values"/>
          </div>
          <Button severity="success" raised @click="service.process()">Вычислить</Button>
        </template>
      </Card> 
      <Card v-if="service.result.value || service.failed.value">
        <template #title>Расчет</template>
        <template #content>
          <SimpleErrorResultView 
            v-if="service.result.value"
            :result="service.result.value"
          />
          <div v-if="service.failed.value">
            <p>
              Кажется, выборка слишком груба
            </p>
          </div>
        </template>
      </Card> 
    </div>
  </div>
</template>

<style scoped></style>
