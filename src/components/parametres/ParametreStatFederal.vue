<script setup>
import { computed } from "vue";
import { useStatFederalStore } from "../../stores/intervention/StatFederal.js";

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Désignation", key: "designation" },
  { title: "Actif", key: "statut", type: Boolean },
];

const statFederalStore = useStatFederalStore();
const statsFederales = computed(() => statFederalStore.liste.slice().sort((a, b) => a.tri - b.tri));
</script>

<template>
  <base-card title="Statistique fédéral">
    <template #body-table>
      <base-table
        :data="statsFederales"
        :fields="fields"
        no-data="Aucune statistique fédérale"
        :selectable="true"
      />
    </template>
  </base-card>
</template>
