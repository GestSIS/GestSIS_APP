<template>
  <div class="row">
    <div class="col-3">
      <div class="card">
        <div class="card-header">TODO: Ajout filtre</div>
        <navigation-par-emplacement />
      </div>
    </div>
    <div class="col-9">
      <Suspense>
        {{ id }}
        <template #fallback>Chargement...</template>
      </Suspense>
    </div>
  </div>
</template>

<script setup>
import NavigationParEmplacement from './NavigationParEmplacement.vue';

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
