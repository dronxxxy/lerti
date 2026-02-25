<script setup lang="ts">
  import type Decimal from 'decimal.js';
  import { Badge } from 'primevue';
  import { computed } from 'vue';

  const props = defineProps<{
    sample: Decimal[],
    danger: number[],
    success: boolean,
  }>()

  const defaultColor = computed(() => props.success ? 'success' : 'secondary')
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