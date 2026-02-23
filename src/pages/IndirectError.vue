<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import useIndirectError from '@/models/indirectError';

  const service = useIndirectError(); 
</script>

<template>
  <CardList>
    <Card>
      <template #title>
        Данные
      </template>
      <template #content>
        <div class="flex flex-row justify-center">
          <FormulaInput
            v-model="service.formula.value"
            class="w-[50%]"
          />
        </div>
      </template>
    </Card>
  </CardList>
</template>
