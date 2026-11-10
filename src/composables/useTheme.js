import { computed, ref, watchEffect } from "vue";
import { useLocalStorage } from "./useStorage.js";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const systemTheme = ref(prefersDark.matches ? "dark" : "light");
prefersDark.addEventListener("change", (e) => {
  systemTheme.value = e.matches ? "dark" : "light";
});

// Choix explicite de l'utilisateur, null tant qu'il n'a pas choisi : on suit alors le système.
// Texte brut (pas JSON) pour relire les valeurs déjà enregistrées ; suivi entre onglets.
const choice = useLocalStorage("theme", null, { raw: true, syncTabs: true });

const theme = computed(() => choice.value ?? systemTheme.value);

watchEffect(() => {
  document.documentElement.setAttribute("data-bs-theme", theme.value);
});

export function useTheme() {
  const toggleTheme = () => {
    choice.value = theme.value === "dark" ? "light" : "dark";
  };

  return { theme, toggleTheme };
}
