<script setup lang="ts">
  import TableForApprox from './TableForApprox.vue';
  import { Card, SelectButton } from 'primevue'
  import useMinSquareMethod from '@/composables/approxMinSquare';
  import { ref, computed, watch } from 'vue'
  import { Chart } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, type ChartData, type ChartDataset } from 'chart.js'
  import InlineFormulaView from '@/components/math/InlineFormulaView.vue';

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

  const tools=[
    {
      name:"Линейный"
    },
    {
      name:"Экспоненциальный"
    },
    {
      name:"Гиперболический"
    }
  ]
  
  let selgr = "";
  const selectedTool = ref<string>("Линейный");

  const service = useMinSquareMethod()

  watch([() => service.xValues.value, () => service.yValues.value, selectedTool], 
    ([xVals, yVals, tool]) => {
      if (xVals?.length > 1 && yVals?.length > 1) {
        const methodMap: Record<string, string> = {
          "Линейный": "linear",
          "Экспоненциальный": "exponential",
          "Гиперболический": "hyperbolic"
        };
        service.approximate(xVals, yVals, methodMap[tool])
      }
    }, 
    { deep: true, immediate: true }
  )

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
        let approxYVals: number[];
      
      if (selectedTool.value === 'Линейный') {
        approxYVals = xVals.map((val) => kk * val + bb);
        selgr="`y = ${service.result.value.k?.toFixed(4)} \\cdot x + ${service.result.value.b?.toFixed(4)}`";
      } 
      else if (selectedTool.value === 'Экспоненциальный') {
        approxYVals = xVals.map((val) => bb * Math.exp(kk * val));
        selgr="`y = ${service.result.value.k?.toFixed(4)} \\cdot  e^${service.result.value.b?.toFixed(4)} \\cdot x`";
      } 
      else if (selectedTool.value === 'Гиперболический') {
        approxYVals = xVals.map((val) => kk / val + bb);
        selgr="`y = ${service.result.value.k?.toFixed(4)} \\cdot x + ${service.result.value.b?.toFixed(4)}`";
      } 
      else {
        selgr="`y = ${service.result.value.k?.toFixed(4)} \\cdot x + ${service.result.value.b?.toFixed(4)}`";
        approxYVals = xVals.map((val) => kk * val + bb);
      }
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
          label: `График аппроксимации (${selectedTool.value})`,
          data: approxYVals,
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
          <div class="flex justify-center mb-3">
          <SelectButton
          v-model="selectedTool"
          name="selection"
          :options="tools.map((e) => e.name)"
          />
          </div>
          <div class="grid grid-cols-2 gap-4">
<!--            <div>
              <div style="color: rgb(34, 197, 94);">Коэффициенты</div>
              <div class="font-mono text-lg">
                <InlineFormulaView :value="`k = ${service.result.value.k?.toFixed(4)}`"/><br>
                <InlineFormulaView :value="`b = ${service.result.value.b?.toFixed(4)}`"/>
              </div>
            </div>-->
            <div>
              <div style="color: rgb(34, 197, 94);">Качество аппроксимации</div>
              <div class="font-mono text-lg">
                <InlineFormulaView :value="`R^2 = ${service.result.value.Squared?.toFixed(4)}`"/>
              </div>
            </div>
          </div>
          
          <div>
            <div style="color: rgb(34, 197, 94);">Уравнение</div>
            <div class="font-mono text-lg">
              <InlineFormulaView :value=selgr/>
            </div>
          </div>
        </template>
      </Card>
      
      <Card v-else-if="service.xValues.value?.length > 0 || service.yValues.value?.length > 0">
        <template #content>
          <div style="color: rgb(34, 197, 94);">
            Недостаточно данных для аппроксимации. 
            Требуется минимум 2 пары точек. (Сейчас 0 пар)
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>