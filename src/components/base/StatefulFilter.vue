<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';

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

const store = useStore();
const sisKey = computed(() => store.state['auth'].sis.activeKey);

const filters = ref({});

const filteredData = computed(() => {
  return data.filter(
    Object.entries(filters.value)
      .filter(([, val]) => val >= 0 || typeof val === 'function')
      .map(([key, value]) => {
        if (typeof value == 'function') {
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
  return !!Object.entries(filters.value).find(([, value]) => value) ?? false;
});

const init = () => {
  filters.value = {
    ...JSON.parse(localStorage.getItem(`${sisKey.value}-${id}`) ?? '{}'),
  };
};

const setFilter = (key, value) => {
  const types = new Set(['function', 'undefined']);
  filters.value = {
    ...filters.value,
    [key]: types.has(typeof value) ? value : parseInt(value),
  };
  localStorage.setItem(
    `${sisKey.value}-${id}`,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(filters.value).filter(
          ([, value]) => !types.has(typeof value) && value != null,
        ),
      ),
    ),
  );
};

const reset = () => {
  filters.value = {};
};

onBeforeMount(init);
watch(sisKey, init);
</script>

<template>
  <slot
    name="default"
    v-bind="{ setFilter, filters, filteredData, reset, canReset }"
  ></slot>
</template>
