<template>
  <div class="row">
    <div class="col-3">
      <div class="card">
        <div class="card-header">TODO: Ajout filtre</div>
        <navigation-par-emplacement />
      </div>
    </div>
    <div class="col-9">
      <div class="row" v-if="parseInt(id) > 0">
        <div class="col-12">
          <suspense>
            <emplacement-detail :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
        <div class="col-12">
          <Suspense>
            <liste-materiel-pour-type :id="id" />
            <template #fallback>Chargement...</template>
          </Suspense>
        </div>
      </div>
      <div v-else class="card">
        <div class="card-header">
          <h5 class="m-0">Aucun type sélectionné</h5>
        </div>
        <div class="card-body">
          Sélectionnez un matériel type dans la liste de gauche
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ListeMaterielPourType from './ListeMaterielPourType.vue';
import NavigationParEmplacement from './NavigationParEmplacement.vue';
import EmplacementDetail from './EmplacementDetail.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

table a.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>
