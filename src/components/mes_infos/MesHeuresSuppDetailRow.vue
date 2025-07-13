<script setup>
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

const computedData = computed(() => [
  rowData.heures.reduce(
    (acc, h) => {
      acc['k' + h.id] = `${h.quantite} ${
        store.state.unite.liste.find((u) => u.id == h.type_unite_id)?.unite
      }`;
      return acc;
    },
    { id: 1 },
  ),
]);

const computedFields = computed(() =>
  rowData.heures.map((h) => ({
    title: h.designation,
    key: 'k' + h.id,
    columnClass: 'col-3',
  })),
);
</script>

<template>
  <base-table
    :fields="computedFields"
    :data="computedData"
    :hide-download="true"
  />
</template>

<style scoped>
th {
  border-top: none;
}
</style>
