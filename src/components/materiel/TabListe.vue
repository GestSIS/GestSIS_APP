<template>
  <div class="row">
    <div class="col-3">
      <div class="card">
        <div class="card-header">TODO: Ajout filtre</div>
        <materiel-type-categorie-select />
      </div>
    </div>
    <div class="col-9">
      <Suspense>
        <router-view />
        <template #fallback>Chargement...</template>
      </Suspense>
    </div>
  </div>
</template>

<script setup>
import MaterielTypeCategorieSelect from './MaterielTypeCategorieSelect.vue';
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
