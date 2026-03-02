<script setup lang="ts">
  import TableForApprox from './TableForApprox.vue';
  import { Card, SelectButton, Button } from 'primevue'
  import useMinSquareMethod, { type ApproximationType } from '@/composables/approxMinSquare';
  import { ref, computed, watch } from 'vue'
  import { Chart } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, type ChartData, type ChartDataset } from 'chart.js'
  import InlineFormulaView from '@/components/math/InlineFormulaView.vue';

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

  const tools = [
    { name: "Линейный" },
    { name: "Экспоненциальный (beta)" },
    { name: "Гиперболический (beta)" }
  ]

  const selectedTool = ref<string>("Линейный");
  const autoMode = ref<boolean>(false);

  const service = useMinSquareMethod()

  const findBestApproximation = () => {
    const xVals = service.xValues.value;
    const yVals = service.yValues.value;
    
    if (!xVals?.length || !yVals?.length || xVals.length < 2 || yVals.length < 2) return;
    
    const results: { type: string; r2: number }[] = [];
    const types: ApproximationType[] = ["linear", "exponential", "hyperbolic"];
    
    for (const type of types) {
      if (type === "exponential" && yVals.some(y => y <= 0)) continue;
      if (type === "hyperbolic" && xVals.some(x => x === 0)) continue;
      
      const result = service.approximate(xVals, yVals, type);
      if (result && result.er === 0) {
        results.push({
          type: type,
          r2: result.Squared.toNumber()
        });
      }
    }
    
    if (results.length > 0) {
      results.sort((a, b) => b.r2 - a.r2);
      const bestResult = results[0];
      if (bestResult) {
        const toolMap: Record<string, string> = {
          "linear": "Линейный",
          "exponential": "Экспоненциальный (beta)",
          "hyperbolic": "Гиперболический (beta)"
        };
        const toolName = toolMap[bestResult.type];
        if (toolName) {
          selectedTool.value = toolName;
          
          const methodMap: Record<string, ApproximationType> = {
            "Линейный": "linear",
            "Экспоненциальный (beta)": "exponential",
            "Гиперболический (beta)": "hyperbolic"
          };
          const approximationType = methodMap[toolName];
          service.approximate(xVals, yVals, approximationType);
        }
      }
    }
  };

  watch([() => service.xValues.value, () => service.yValues.value, selectedTool], 
    ([xVals, yVals, tool]) => {
      if (xVals?.length > 1 && yVals?.length > 1) {
        if (!autoMode.value) {
          const methodMap: Record<string, ApproximationType> = {
            "Линейный": "linear",
            "Экспоненциальный (beta)": "exponential",
            "Гиперболический (beta)": "hyperbolic"
          };
          const approximationType = methodMap[tool];
          service.approximate(xVals, yVals, approximationType);
        }
      }
    }, 
    { deep: true, immediate: true }
  )

  watch([() => service.xValues.value, () => service.yValues.value, autoMode], 
    ([xVals, yVals, auto]) => {
      if (xVals?.length > 1 && yVals?.length > 1 && auto) {
        findBestApproximation();
      }
    }, 
    { deep: true }
  )

  const chartData = computed<ChartData>(() => {
    const xs = service.xValues.value || []
    const ys = service.yValues.value || []

    const validPoints = xs.reduce<{ x: number; y: number }[]>((acc, x, i) => {
      if (i < ys.length && ys[i] !== undefined && x !== undefined) {
        acc.push({ x, y: ys[i] as number });
      }
      return acc;
    }, []);
    
    validPoints.sort((a, b) => a.x - b.x);

    const xVals = validPoints.map((p) => p.x)
    const yVals = validPoints.map((p) => p.y)

    const datab = (): ChartDataset[] => {
      const v = service.result.value;
      
      const scatterDataset: ChartDataset = {
        type: 'scatter',
        label: 'Экспериментальные точки',
        data: validPoints.map(p => ({ x: p.x, y: p.y })),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointRadius: 5,
        pointHoverRadius: 8
      };

      if (!v || v.er !== 0) {
        return [scatterDataset];
      }

      const kk = v.k.toNumber();
      const bb = v.b.toNumber();
      let approxYVals: number[];
      
      if (selectedTool.value === 'Линейный') {
        approxYVals = xVals.map((val) => kk * val + bb);
      } 
      else if (selectedTool.value === 'Экспоненциальный (beta)') {
        approxYVals = xVals.map((val) => bb * Math.exp(kk * val));
      } 
      else {
        approxYVals = xVals.map((val) => val !== 0 ? kk / val + bb : bb);
      }
      
      return [
        scatterDataset,
        {
          type: 'line',
          label: `График аппроксимации (${selectedTool.value}${autoMode.value ? ' - авто' : ''})`,
          data: approxYVals,
          borderColor: 'rgb(255, 69, 0)',
          backgroundColor: 'rgba(255, 69, 0, 0.2)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
          xAxisID: 'x',
          yAxisID: 'y'
        }
      ];
    }

    return {
      labels: xVals.map((val) => val.toFixed(2)),
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
            if (context.dataset.type === 'scatter') {
              return `X: ${context.raw.x.toFixed(4)}, Y: ${context.raw.y.toFixed(4)}`;
            }
            return `Y: ${context.raw.toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'X значения'
        }
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
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

  const equationText = computed(() => {
    const v = service.result.value;
    if (!v || v.er !== 0) return "y = ...";
    
    const k = v.k.toNumber().toFixed(4);
    const b = v.b.toNumber().toFixed(4);
    
    if (selectedTool.value === 'Линейный') {
      return `y = ${k} \\cdot x + ${b}`;
    } 
    else if (selectedTool.value === 'Экспоненциальный (beta)') {
      return `y = ${b} \\cdot e^{${k} \\cdot x}`;
    } 
    else {
      return `y = \\frac{${k}}{x} + ${b}`;
    }
  })

  const rSquaredText = computed(() => {
    const v = service.result.value;
    if (!v || v.er !== 0) return "R^2 = ...";
    return `R^2 = ${v.Squared.toNumber().toFixed(4)}`;
  })

  const errorMessage = computed(() => {
    const v = service.result.value;
    if (!v) return '';
    
    switch(v.er) {
      case 1: return 'Математическая ошибка: знаменатель равен нулю';
      case 2: return 'Значения Y должны быть больше нуля для экспоненциальной аппроксимации';
      case 3: return 'Некорректные входные данные';
      case 4: return 'X не может быть равен нулю для гиперболической аппроксимации';
      default: return '';
    }
  })

  const toggleAutoMode = () => {
    autoMode.value = !autoMode.value;
    if (autoMode.value) {
      findBestApproximation();
    }
  };
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
          <div class="flex flex-col items-center">
            <span>График аппроксимации</span>
            <div class="flex justify-center items-center gap-4 m-3">
              <SelectButton
                v-model="selectedTool"
                :options="tools.map((e) => e.name)"
                :allowEmpty="false"
                :disabled="autoMode"
              />
              <Button 
                :label="autoMode ? 'Авто (вкл)' : 'Авто'"
                :severity="autoMode ? 'success' : 'secondary'"
                @click="toggleAutoMode"
                size="small"
              />
            </div>
          </div>
        </template>
        <template #content>
          <div style="height: 400px; width: 100%;">
            <Chart type="scatter" :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </Card>

      <Card v-if="service.result.value && service.result.value.er === 0">
        <template #title>
          <span>Результаты аппроксимации</span>
        </template>
        <template #content>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <div style="color: rgb(34, 197, 94);">Качество аппроксимации</div>
              <div class="font-mono text-lg">
                <InlineFormulaView :value="rSquaredText"/>
              </div>
            </div>
            <div>
              <div style="color: rgb(34, 197, 94);">Уравнение</div>
              <div class="font-mono text-lg">
                <InlineFormulaView :value="equationText"/>
              </div>
            </div>
            <div v-if="autoMode" class="text-sm text-gray-500">
              Автоматически выбран метод: {{ selectedTool }}
            </div>
          </div>
        </template>
      </Card>
      
      <Card v-else-if="service.result.value && service.result.value.er !== 0">
        <template #content>
          <div class="flex justify-center" style="color: rgb(255, 69, 0);">
            {{ errorMessage }}
          </div>
        </template>
      </Card>
      
      <Card v-else-if="hasData && pairsCount < 2">
        <template #content>
          <div class="flex justify-center" style="color: rgb(34, 197, 94);">
            Недостаточно данных для аппроксимации. 
            Требуется минимум 2 пары точек. (Сейчас {{ pairsCount }} {{ pairsCount === 1 ? 'пара' : 'пар' }})
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>