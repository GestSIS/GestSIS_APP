<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ListeArticlePourSapeur from '../materiel/ListeArticlePourSapeur.vue';

const store = useStore();

const activeSapeurId = computed(() => store.state.sapeur.active.id);
</script>

<template>
  <suspense v-if="parseInt(activeSapeurId) > 0">
    <liste-article-pour-sapeur :id="activeSapeurId" />
    <template #fallback>Chargement...</template>
  </suspense>
</template>
