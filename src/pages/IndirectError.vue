<script setup lang="ts">
  import CardList from '@/components/CardList.vue';
  import { Card } from 'primevue';
  import FormulaInput from '@/components/FormulaInput.vue';
  import { ref, watch } from 'vue';

  const formula = ref("")

  watch(formula, (e) => console.log(e))
</script>

<template>
  <CardList>
    <Card>
      <template #title>
        Данные
      </template>
      <template #content>
        <div class="flex flex-row justify-center">
          <FormulaInput v-model="formula" class="w-[50%]" />
        </div>
      </template>
    </Card>
  </CardList>
</template>
