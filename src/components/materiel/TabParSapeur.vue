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
      <div v-else class="card">
        <div class="card-header">
          <h5 class="m-0">Aucun sapeur sélectionné</h5>
        </div>
        <div class="card-body">
          Sélectionnez un sapeur dans la liste de gauche
        </div>
      </div>
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
