<script setup lang="ts">
  import { buildPdfPath } from '@/shared/constants';
  import { openUrl } from '@/shared/link';
  import { Button } from 'primevue';

  const props = defineProps<{
    page: number
  }>()
</script>

<template>
  <Button
    class="small-button"
    rounded
    size="small"
    icon="pi pi-info-circle"
    aria-label="Save"
    severity="info"
    @click="openUrl(buildPdfPath(props.page))"
  ></Button>
</template>

<style scoped>
  .small-button {
    transform: scale(0.8);
  }
</style>