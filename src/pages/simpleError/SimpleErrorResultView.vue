<script setup lang="ts">
  import { Divider, Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primevue';
  import SampleView from '@/components/math/SampleView.vue';
  import { computed, ref } from 'vue';
  import DocsButton from '@/components/basics/DocsButton.vue';
  import type { CalculationResult } from '@/shared/math/simpleError';
  import ErrorValue from '@/components/math/ErrorValue.vue';
  import InlineFormulaView from '@/components/math/InlineFormulaView.vue';
  import HorizontalCenter from '@/components/basics/HorizontalCenter.vue';

  const props = defineProps<{
    result: CalculationResult 
  }>()

  const RUDE_CLEANING = "0"
  const RESULT = "1"

  const opened = ref<string[]>([RESULT])

  const formulas = computed(() => props.result.rudeCleaning.map((stage) => stage.missSide ? `
    x_${{right: stage.sample.length - 1, left: 1, }[stage.missSide]} -
      x_${ { right: stage.sample.length - 2, left: 0, }[stage.missSide] } \\approx
    ${stage.allowedDiff} > u \\cdot R = ${stage.u} \\cdot ${ {
      right: stage.rightDiff,
      left: stage.leftDiff,
    }[stage.missSide] } \\approx ${stage.u.mul({
      right: stage.rightDiff,
      left: stage.leftDiff,
    }[stage.missSide])}
  ` : undefined))
</script>

<template>
  <Accordion class="w-[100%]" v-model="opened" multiple>
    <AccordionPanel :value="RUDE_CLEANING">
      <AccordionHeader>
        <div class="flex flex-row items-center gap-2">
          <span>Устранение грубых погрешностей</span>
          <DocsButton :page="25" module="2.7." />
        </div>
      </AccordionHeader>
      <AccordionContent>
        <template v-for="(stage, stageIndex) in props.result.rudeCleaning">
          <Divider v-if="stageIndex != 0"></Divider>
          <div v-if="stage.missSide === null">
            <p>Грубых промахов {{ stageIndex == 0 ? "" : "больше" }} нет, выборка очищена!</p>
          </div>
          <div v-else>
            <p>
              Найден грубый промах {{ {
                right: "справа",
                left: "слева",
              }[stage.missSide] }}:
              <InlineFormulaView :value="formulas[stageIndex]!" />
            </p>
          </div>
          <SampleView
            :danger="stage.missSide ? {
              left: [0, 1],
              right: [stage.sample.length - 1, stage.sample.length - 2],
            }[stage.missSide] : []"
            :success="stage.missSide === null"
            :sample="stage.sample"
          />
        </template>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
  <ErrorValue :value="props.result.value" :error="props.result.error" var="x" />
</template>
