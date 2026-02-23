<script setup lang="ts">
  import Sample from '@/components/Sample.vue';
  import { Card } from 'primevue'
  import useMinSquareMethod from '@/models/approxMinSquare';
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

  const service = useMinSquareMethod()

  const chartData = computed(() => ({
    labels: (service.xvalues.value || []).map((_, i) => `X${i}`),
    datasets: [
      {
        label: 'Значения',
        data: service.xvalues.value || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  }))

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  }
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="lg:w-3/5 sm:w-[100%] p-5 pt-0 flex flex-col gap-4">
      <Card>
        <template #title>
          <div class="flex flex-row justify-between">
            Выборка
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-5 items-stretch pt-2">
            <Sample v-model="service.xvalues.value"/>
          </div>
          <div class="flex flex-col gap-5 items-stretch pt-2">
            <Sample type="y" v-model="service.yvalues.value"/>
          </div>
          </template>
      </Card>

      <Card v-if="service.xvalues.value?.length">
        <template #content>
          <div style="height: 300px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>