<script setup>
import { useRtaStore } from "../../stores/rta/Rta.js";

const rtaStore = useRtaStore();
rtaStore.fetchDemandes();

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
