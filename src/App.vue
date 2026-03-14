<script setup lang="ts">
  import { Toolbar, Button, usePrimeVue } from 'primevue';
  import SelectButton from 'primevue/selectbutton';
  import { RouterView, useRouter, useRoute } from 'vue-router';
  import { ref, watch, onMounted, Transition } from 'vue';
  import useTheme from './components/theming';

  const router = useRouter();
  const route = useRoute();

  const tools = [
    {
      name: "Прямые измерения",
      path: "/simpleError",
    },
    {
      name: "Косвенные измерения",
      path: "/indirectError",
    },
    {
      name: "Совместные измерения",
      path: "/approximation",
    },
  ];

  const selectedTool = ref<string | null>(null);

  const updateSelectedFromPath = () => {
    const tool = tools.find(t => t.path === route.path);
    selectedTool.value = tool ? tool.name : null;
  };

  const theme = useTheme();
  const switchTheme = () => theme.isDarkTheme.value = !theme.isDarkTheme.value;

  watch(selectedTool, (name) => {
    if (name) {
      const tool = tools.find(t => t.name === name);
      if (tool) router.push(tool.path);
    }
  });

  onMounted(() => updateSelectedFromPath());
  watch(() => route.path, () => updateSelectedFromPath());
</script>

<template>
  <Toolbar class="m-3 mb-5">
    <template #start>
      <img src="/favicon.ico" width="40px" />
    </template>
    <template #center>
      <SelectButton
        v-model="selectedTool"
        name="selection"
        :options="tools.map((e) => e.name)"
      />
    </template>
    <template #end>
      <Button :icon="theme.isDarkTheme.value ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" raised @click="switchTheme" />
    </template>
  </Toolbar>

  <RouterView v-slot="{ Component }">
    <Transition name="scale" mode="out-in">
      <keep-alive>
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </Transition>
  </RouterView>
</template>

<style scoped>
.scale-enter-active, .scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
