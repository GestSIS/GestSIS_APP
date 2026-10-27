<script setup>
import { computed } from "vue";
import { travailStatut } from "../../composables/travailStatuts.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTravailTypeStore } from "../../stores/travail/TravailType.js";

// Fiches de travail d'une ligne (exercice d'un sapeur), en détail dépliable d'un base-table
const { rowData } = defineProps({
  rowData: {
    type: Object,
    required: true,
  },
});

const uniteStore = useUniteStore();
const travailTypeStore = useTravailTypeStore();
uniteStore.fetchUnites();
travailTypeStore.fetchTravailTypes();

const travaux = computed(() =>
  (rowData.travaux ?? []).map((t) => {
    const type = travailTypeStore.liste.find((e) => e.id == t.travail_type_id);
    return {
      ...t,
      travail: type?.designation,
      unite: uniteStore.liste.find((u) => u.id == type?.type_unite_id)?.unite,
    };
  }),
);

const fields = [
  { title: "Travail", key: "travail" },
  { title: "Désignation", key: "designation" },
  { title: "Quantité", key: "quantite", slot: "quantite" },
  { title: "Statut", key: "statut", slot: "statut" },
];
</script>

<template>
  <base-table
    :fields="fields"
    :data="travaux"
    :hide-download="true"
    no-data="Aucune fiche de travail liée"
  >
    <template #quantite="{ rowData: travail }">{{ travail.quantite }} {{ travail.unite }}</template>
    <template #statut="{ value }">
      <status-badge :status="travailStatut(value)" />
    </template>
  </base-table>
</template>
