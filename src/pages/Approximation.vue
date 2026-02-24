<script setup lang="ts">
  import TableForApprox from '@/components/TableForApprox.vue';
  import { Card } from 'primevue'
  import useMinSquareMethod from '@/models/approxMinSquare';
  import { computed, watch } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

  const service = useMinSquareMethod()

  const chartData = computed(() => {
    const xVals = service.xValues.value || []
    const yVals = service.yValues.value || []
    
    const minLength = Math.min(xVals.length, yVals.length)
    
    return {
      labels: xVals.slice(0, minLength).map((val) => val.toFixed(2)),
      datasets: [
        {
          label: 'Экспериментальные точки',
          data: yVals.slice(0, minLength),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8
        }
      ]
    }
  })

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Y: ${context.raw.toFixed(4)}`
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'X значения'
        },
        grid: {
          display: true
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y значения'
        },
        grid: {
          display: true
        }
      }
    }
  }))

  const hasData = computed(() => {
    const xVals = service.xValues.value || []
    const yVals = service.yValues.value || []
    return xVals.length > 0 && yVals.length > 0 && Math.min(xVals.length, yVals.length) > 0
  })


  const pairsCount = computed(() => {
    const xVals = service.xValues.value || []
    const yVals = service.yValues.value || []
    return Math.min(xVals.length, yVals.length)
  })


  const xValues = computed({
    get: () => service.xValues.value || [],
    set: (value) => { 
      service.xValues.value = value
      //МНК
      service.approximate(service.xValues.value, service.yValues.value, "linear")
    }
  })

  const yValues = computed({
    get: () => service.yValues.value || [],
    set: (value) => { 
      service.yValues.value = value
      // МНК
      service.approximate(service.xValues.value, service.yValues.value, "linear")
    }
  })

  watch([() => service.xValues.value, () => service.yValues.value], () => {
    service.approximate(service.xValues.value, service.yValues.value, "linear")
  }, { deep: true })
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="lg:w-3/5 sm:w-[100%] p-5 pt-0 flex flex-col gap-4">
      <Card>
        <template #title>
          <div class="flex flex-row justify-between">
            <span>Ввод данных</span>
            <span class="text-sm text-gray-500">
              Пар точек: {{ pairsCount }}
            </span>
          </div>
        </template>
        <template #content>
          <TableForApprox 
            type="both" 
            v-model:x="xValues" 
            v-model:y="yValues" 
          />
        </template>
      </Card>

      <Card v-if="hasData">
        <template #title>
          <div class="flex flex-row justify-between">
            <span>График зависимости Y = f(X)</span>
          </div>
        </template>
        <template #content>
          <div style="height: 400px; width: 100%;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </Card>

      <Card v-if="service.result.value">
        <template #title>
          <span>Результаты аппроксимации</span>
        </template>
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-blue-50 rounded">
              <div class="text-sm text-gray-600">Коэффициенты</div>
              <div class="font-mono text-lg">
                a = {{ service.result.value.k?.toFixed(4) }}<br>
                b = {{ service.result.value.b?.toFixed(4) }}
              </div>
            </div>
            <div class="p-3 bg-green-50 rounded">
              <div class="text-sm text-gray-600">Качество аппроксимации</div>
              <div class="font-mono text-lg">
                R2 = {{ service.result.value.Squared?.toFixed(4) }}
              </div>
            </div>
          </div>
          
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Уравнение</div>
            <div class="font-mono text-lg">
              y = {{ service.result.value.k?.toFixed(4) }}x + {{ service.result.value.b?.toFixed(4) }}
            </div>
          </div>
        </template>
      </Card>
      
      <Card v-else-if="service.xValues.value?.length > 0 || service.yValues.value?.length > 0">
        <template #content>
          <div class="text-center text-gray-500 p-4">
            Недостаточно данных для аппроксимации. 
            Требуется минимум 2 пары точек. (Сейчас {{ pairsCount }} пар)
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>