<script setup>
import { ref } from "vue";

const { rowData, options } = defineProps({
  rowData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => {},
  },
});

const loading = ref(true);
const data = ref([]);

rowData.getData().then((loadedData) => {
  data.value = loadedData;
  loading.value = false;
});
</script>

<template>
  <base-table
    :loading="loading"
    :fields="options.fields"
    :no-data="options.noData ?? ''"
    :data="data"
    :hide-download="true"
  />
</template>

<style scoped>
th {
  border-top: none;
}
</style>
