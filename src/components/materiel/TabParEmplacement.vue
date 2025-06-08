<script setup>
import ListeArticlePourEmplacement from './ListeArticlePourEmplacement.vue';
import NavigationParEmplacement from './NavigationParEmplacement.vue';
import EmplacementDetail from './EmplacementDetail.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

// TODO: Redirect au premier élément si id=null et que des emplacements existent ?
</script>

<template>
  <div class="row">
    <div class="col-3">
      <suspense>
        <navigation-par-emplacement />
        <template #fallback>Chargement...</template>
      </suspense>
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
            <liste-article-pour-emplacement :id="id" />
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
