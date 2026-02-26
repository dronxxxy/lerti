<script setup lang="ts">
  import { Card } from 'primevue';
  import DocsButton from './DocsButton.vue';

  const props = defineProps<{
    title: string,
    docs?: {
      page: number,
      module: string,
    }
  }>();
</script>

<template>
  <Card>
    <template #title>
      <div class="flex flex-row justify-between text-center">
        {{ props.title }}
        <DocsButton
          v-if="props.docs"
          :page="props.docs.page"
          :module="props.docs.module"
        />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-5 items-center pt-2">
        <slot></slot>
      </div>
    </template>
  </Card> 
</template>