<script setup>
import { formatBorne } from "../../tools/index.js";

defineProps({
  controle: {
    type: Object,
    required: true,
  },
});

const tacheTypes = {
  BOOLEAN: { label: "OK / KO", classe: "badge bg-info" },
  NUMERIC: { label: "Numérique", classe: "badge bg-warning text-dark" },
  COMPOSANT: { label: "Composant", classe: "badge bg-primary" },
};

const typesAcceptes = (tache) =>
  (tache.materiel_types ?? []).map((mt) => mt.materiel_type?.designation).join(", ");

const fields = [
  { title: "#", key: "order" },
  { title: "Nom", key: "nom" },
  { title: "Description", key: "description" },
  { title: "Type", slot: "type" },
  { title: "Détail", slot: "detail" },
  { title: "Unité", key: "unit" },
  {
    title: "Min",
    key: "value_min",
    formatter: (value) => (value === null ? "" : formatBorne(value)),
  },
  {
    title: "Max",
    key: "value_max",
    formatter: (value) => (value === null ? "" : formatBorne(value)),
  },
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
      <span :class="tacheTypes[rowData.type].classe">
        {{ tacheTypes[rowData.type].label }}
      </span>
    </template>
    <template #detail="{ rowData }">
      <template v-if="!rowData.obligatoire">Optionnel</template>
      <template v-if="rowData.type === 'COMPOSANT'">
        <template v-if="!rowData.obligatoire"> · </template>{{ typesAcceptes(rowData) }}
      </template>
    </template>
  </base-table>
</template>
