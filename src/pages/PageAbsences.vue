<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Absences</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'absences' }, texte: 'Tableau de bord' },
            { to: { name: 'absences-liste' }, texte: 'Liste' },
          ]"
        />
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import store from '/src/store/index';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { onBeforeRouteUpdate } from 'vue-router';

async function loadData() {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalities = store.dispatch('fetchLocalites');
  const loadGroupes = store.dispatch('fetchGroupes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadPermisType = store.dispatch('fetchPermisType');

  await Promise.all([
    loadSapeurs,
    loadLocalities,
    loadGroupes,
    loadFonctions,
    loadPermisType,
  ]);
}
onBeforeRouteUpdate(loadData);
</script>

<style></style>
