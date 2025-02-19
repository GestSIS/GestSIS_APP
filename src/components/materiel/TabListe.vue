<template>
  <div class="row">
    <div class="col-3">
      <materiel-type-categorie-select />
    </div>
    <div class="col-6"></div>
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
