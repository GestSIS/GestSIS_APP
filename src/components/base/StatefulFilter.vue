<script setup>
import { ref, computed, watch, onBeforeMount } from "vue";
import { useAuthStore } from "../../stores/auth/Auth";
import { useLocalStorage } from "../../composables/useStorage.js";

const authStore = useAuthStore();

defineOptions({
  inheritAttrs: false,
});

const { id, data } = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
});

const sisKey = computed(() => authStore.organisation.activeKey);

const filters = ref({});
// Filtres enregistrés par SIS : relus automatiquement au changement de SIS
const savedFilters = useLocalStorage(() => `${sisKey.value}-${id}`, {});

const filteredData = computed(() => {
  return data.filter(
    Object.entries(filters.value)
      .filter(([, val]) => val >= 0 || typeof val === "function")
      .map(([key, value]) => {
        if (typeof value == "function") {
          return (x) => value(x[key]);
        } else {
          return (x) => x[key] == value;
        }
      })
      .reduce(
        (f, g) => (x) => f(x) && g(x),
        () => true,
      ),
  );
});
const canReset = computed(() => {
  return !!Object.entries(filters.value).find(([, value]) => value != null && value !== "");
});

const init = () => {
  filters.value = { ...savedFilters.value };
};

const setFilter = (key, value) => {
  const types = new Set(["function", "undefined"]);
  filters.value = {
    ...filters.value,
    [key]: types.has(typeof value) ? value : parseInt(value, 10),
  };
  // Les filtres de type fonction ne sont pas enregistrables
  savedFilters.value = Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => !types.has(typeof value) && value != null),
  );
};

const reset = () => {
  filters.value = {};
  savedFilters.value = null;
};

onBeforeMount(init);
watch(sisKey, init);
</script>

<template>
  <slot name="default" v-bind="{ setFilter, filters, filteredData, reset, canReset }"></slot>
</template>
