import { onMounted, ref, watch } from "vue";

export default function useTheme() {
  const darkThemeClass = "lerti-dark-theme";
  const storageKey = "lertiDarkTheme";

  const isDarkTheme = ref(true);

  const applyTheme = (isDarkTheme: boolean) => {
    const classList = document.documentElement.classList;
    if (isDarkTheme) {
      classList.add(darkThemeClass)
    } else {
      classList.remove(darkThemeClass)
    }
  }

  onMounted(() => {
    const isDarkThemePreferred = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    const storageValue = localStorage.getItem(storageKey);
    isDarkTheme.value = storageValue === null ? isDarkThemePreferred : storageValue === "true";
    applyTheme(isDarkTheme.value);
  })

  watch(isDarkTheme, (isDarkTheme) => {
    applyTheme(isDarkTheme);
    localStorage.setItem(storageKey, String(isDarkTheme));
  })

  return {
    isDarkTheme,
  }
}
