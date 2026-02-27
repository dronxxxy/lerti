<script setup lang="ts">
  import TableForApprox from './TableForApprox.vue';
  import { Card } from 'primevue'
  import useMinSquareMethod from '@/composables/approxMinSquare';
  import { computed, watch } from 'vue'
  import { Chart } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, type ChartData, type ChartDataset } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

  const service = useMinSquareMethod()

  watch([() => service.xValues.value, () => service.yValues.value], () => {
    if (service.xValues.value?.length > 1 && service.yValues.value?.length > 1) {
      service.approximate(service.xValues.value, service.yValues.value, "linear")
    }
  }, { deep: true })

  const chartData = computed(() => {
    const xs= service.xValues.value || []
    const ys=service.yValues.value || []

    const points = xs.map((x, i) => ({ x, y: ys[i]! }));
    points.sort((a, b) => a.x - b.x);

    const xVals = points.map((p) => p.x)
    const yVals = points.map((p) => p.y)

    
    const datab = ()=>{
      const v=service.result.value;
      if (v!=null){
        const kk = v.k.toNumber();
        const bb = v.b.toNumber();
        return [
        {
          type:'scatter',
          label: 'Экспериментальные точки',
          data: yVals.map((y, i) => ({ y, x: xVals[i]! })),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8
        } , 
        {
          type:'line',
          label: 'График аппроксимации (МНК)',
          data: xVals.map((val)=>kk*val+bb),
          borderColor: 'rgb(255, 69, 0)',
          backgroundColor: 'rgba(255, 69, 0, 0.2)',
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8
        }
      ] satisfies ChartDataset[]
      }
      else{
        return [
        {
          type:'scatter',
          label: 'Экспериментальные точки',
          data: yVals.map((y, i) => ({ y, x: xVals[i]! })),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8
        } ] satisfies ChartDataset[]
      }
    }

    const minLength = Math.min(xVals.length, yVals.length)
    return <ChartData>{
      labels: xVals.slice(0, minLength).map((val) => val.toFixed(2)),
      datasets: datab()
    }
  })

  const chartOptions = {
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
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y значения'
        }
      }
    }
  }

  const hasData = computed(() => {
    const xVals = service.xValues.value || []
    const yVals = service.yValues.value || []
    return xVals.length > 0 && yVals.length > 0
  })

  const pairsCount = computed(() => {
    const xVals = service.xValues.value || []
    const yVals = service.yValues.value || []
    return Math.min(xVals.length, yVals.length)
  })
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
            v-model:x="service.xValues.value" 
            v-model:y="service.yValues.value" 
          />
        </template>
      </Card>

      <Card v-if="hasData">
        <template #title>
          <span>График аппроксимации</span>
        </template>
        <template #content>
          <div style="height: 400px; width: 100%;">
            <Chart type="scatter" :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </Card>

      <Card v-if="service.result.value && service.result.value.er!=true">
        <template #title>
          <span>Результаты аппроксимации</span>
        </template>
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div style="color: rgb(34, 197, 94);">Коэффициенты</div>
              <div class="font-mono text-lg">
                k = {{ service.result.value.k?.toFixed(4) }}<br>
                b = {{ service.result.value.b?.toFixed(4) }}
              </div>
            </div>
            <div>
              <div style="color: rgb(34, 197, 94);">Качество аппроксимации</div>
              <div class="font-mono text-gray-600">
                R² = {{ service.result.value.Squared?.toFixed(4) }}
              </div>
            </div>
          </div>
          
          <div>
            <div style="color: rgb(34, 197, 94);">Уравнение</div>
            <div class="font-mono text-lg">
              y = {{ service.result.value.k?.toFixed(4) }}x + {{ service.result.value.b?.toFixed(4) }}
            </div>
          </div>
        </template>
      </Card>
      
      <Card v-else-if="service.xValues.value?.length > 0 || service.yValues.value?.length > 0">
        <template #content>
          <div style="color: rgb(34, 197, 94);">
            Недостаточно данных для аппроксимации. 
            Требуется минимум 2 пары точек. (Сейчас {{ pairsCount }} пар)
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>