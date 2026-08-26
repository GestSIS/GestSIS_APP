<script setup>
import { ref } from "vue";
import { useRtaStore } from "../../stores/rta/Rta.js";

const rtaStore = useRtaStore();
const loadError = ref(null);
rtaStore
  .fetchDemandes()
  .catch(
    (err) => (loadError.value = err?.message ?? "Erreur lors de la récupération des données RTA"),
  );

const fields = [
  { key: "soumise", title: "Soumise le", type: "datetime" },
  { key: "statut", title: "Statut", slot: "statut" },
  { key: "en_traitement", title: "En traitement le", type: "datetime" },
  { key: "traitee", title: "Traitée le", type: "datetime" },
];

const statusMapping = {
  0: "En cours d'édition",
  1: "Soumise",
  2: "En traitement",
  3: "Traitée",
};
</script>

<template>
  <div v-if="loadError" class="card-body mb-3">
    <div class="alert alert-danger mb-0" role="alert">{{ loadError }}</div>
  </div>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">GestSIS</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :fields="fields" :data="rtaStore.demandes">
        <template #statut="{ rowData }">
          {{ statusMapping[rowData.statut] }}
        </template>
      </base-table>
    </div>
  </div>
</template>
