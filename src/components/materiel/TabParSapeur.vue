<template>
  <div class="row">
    <div class="col-3">
      <div class="card">
        <div class="card-header">TODO: Ajout filtre</div>
        <navigation-par-sapeur />
      </div>
    </div>
    <div class="col-9">
      <suspense v-if="parseInt(id) > 0">
        <liste-materiel-pour-sapeur :id="id" />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>

<script setup>
import NavigationParSapeur from './NavigationParSapeur.vue';
import ListeMaterielPourSapeur from './ListeMaterielPourSapeur.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});
</script>

<style></style>
