<script setup>
import { computed } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import ListeArticlePourSapeur from "../materiel/ListeArticlePourSapeur.vue";

const sapeurStore = useSapeurStore();

const activeSapeurId = computed(() => sapeurStore.active.id);
</script>

<template>
  <suspense v-if="parseInt(activeSapeurId) > 0">
    <liste-article-pour-sapeur :id="activeSapeurId" />
    <template #fallback>Chargement...</template>
  </suspense>
</template>
