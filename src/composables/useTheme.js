import { ref } from "vue";

const STORAGE_KEY = "theme";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const theme = ref(localStorage.getItem(STORAGE_KEY) ?? (prefersDark.matches ? "dark" : "light"));

const applyTheme = () => {
  document.documentElement.setAttribute("data-bs-theme", theme.value);
};
applyTheme();

// Suit le thème du système tant que l'utilisateur n'a pas choisi explicitement.
prefersDark.addEventListener("change", (e) => {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    theme.value = e.matches ? "dark" : "light";
    applyTheme();
  }
});

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, theme.value);
    applyTheme();
  };

  return { theme, toggleTheme };
}
