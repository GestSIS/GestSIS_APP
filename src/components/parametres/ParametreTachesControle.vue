<script setup>
defineProps({
  controle: {
    type: Object,
    required: true,
  },
});

const tacheTypeLabel = (type) => (type === "BOOLEAN" ? "OK / KO" : "Numérique");

const fields = [
  { title: "#", key: "order" },
  { title: "Nom", key: "nom" },
  { title: "Description", key: "description" },
  { title: "Type", slot: "type" },
  { title: "Unité", key: "unit" },
  { title: "Min", key: "value_min" },
  { title: "Max", key: "value_max" },
];
</script>

<template>
  <base-table
    :data="controle.taches ?? []"
    :fields="fields"
    no-data="Aucune tâche pour ce contrôle"
    :hide-download="true"
  >
    <template #type="{ rowData }">
      <span :class="rowData.type === 'BOOLEAN' ? 'badge bg-info' : 'badge bg-warning text-dark'">
        {{ tacheTypeLabel(rowData.type) }}
      </span>
    </template>
  </base-table>
</template>
