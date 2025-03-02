<template>
  <div class="row">
    <div class="col-3">
      <div class="card">
        <div class="card-header">TODO: Ajout filtre</div>
        <navigation-par-type />
      </div>
    </div>
    <div class="col-9">
      <div class="row" v-if="parseInt(id) > 0">
        <div class="col-12">
          <suspense>
            <materiel-type-detail :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
        <div class="col-12">
          <suspense>
            <liste-materiel-pour-type :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavigationParType from './NavigationParType.vue';
import MaterielTypeDetail from './MaterielTypeDetail.vue';
import ListeMaterielPourType from './ListeMaterielPourType.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});
</script>

<style></style>
