<script setup>
import NavigationParType from './NavigationParType.vue';
import MaterielTypeDetail from './MaterielTypeDetail.vue';
import ListeArticlePourType from './ListeArticlePourType.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

// TODO: Redirect au premier élément si id=null et que des types existent ?
</script>

<template>
  <div class="row">
    <div class="col-3">
      <suspense>
        <navigation-par-type />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-9">
      <div v-if="parseInt(id) > 0" class="row">
        <div class="col-12">
          <suspense>
            <materiel-type-detail :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
        <div class="col-12">
          <suspense>
            <liste-article-pour-type :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
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

<style></style>
