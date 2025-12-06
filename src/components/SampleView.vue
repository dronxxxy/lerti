<script setup lang="ts">
  import type Decimal from 'decimal.js';
  import { Badge, Card } from 'primevue';

  const props = defineProps<{
    sample: Decimal[],
    danger: number[],
    success: boolean,
  }>()

  const defaultColor = props.success ? 'success' : 'secondary'
</script>

<template>
  <div class="flex flex-row gap-3">
    <Badge
      size="xlarge"
      :severity="danger.includes(i) ? 'danger' : defaultColor"
      v-for="(element, i) in props.sample"
    >
      <span>{{ element }}</span>
    </Badge>
  </div>
</template>