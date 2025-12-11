<script setup lang="ts">
  // TODO: remove relative imports
  import { Divider, Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primevue';
  import { type SimpleErrorResult } from '../models/simpleError';
  import SampleView from './SampleView.vue';
  import { ref } from 'vue';

  const props = defineProps<{
    result: SimpleErrorResult
  }>()

  const RUDE_CLEANING = "0"
  const RESULT = "1"

  const opened = ref<string[]>([RESULT])
</script>

<template>
  <Accordion v-model="opened" multiple>
    <AccordionPanel :value="RUDE_CLEANING">
      <AccordionHeader>Устранение грубых промахов</AccordionHeader>
      <AccordionContent>
        <div v-for="(stage, stageIndex) in props.result.rudeCleaning">
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
              {{stage.allowedDiff}} {{ ">" }} {{stage.u}} * {{ {
                right: stage.rightDiff,
                left: stage.leftDiff,
              }[stage.missSide] }}
            </p>
          </div>
          <div class="w-1/1 flex flex-col items-center mt-3">
            <SampleView
              :danger="stage.missSide ? {
                left: [0, 1],
                right: [stage.sample.length - 1, stage.sample.length - 2],
              }[stage.missSide] : []"
              :success="stage.missSide === null"
              :sample="stage.sample"
            />
          </div>
       </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
  <div class="p-3 text-center">
    <p class="text-2xl mt-3">Значение: <b>{{ props.result.value }} &plusmn; {{ props.result.error }}</b></p>
  </div>
</template>
