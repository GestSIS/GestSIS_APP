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
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'absences' }"
            >Tableau de bord</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'absences-liste' }"
            >Liste</router-link
          >
        </nav>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import store from '/src/store/index';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { onBeforeRouteUpdate } from 'vue-router';

async function loadData({ next }) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalities = store.dispatch('fetchLocalites');
  const loadGroupes = store.dispatch('fetchGroupes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadPermisType = store.dispatch('fetchPermisType');

  Promise.all([
    loadSapeurs,
    loadLocalities,
    loadGroupes,
    loadFonctions,
    loadPermisType,
  ]).then(() => {
    next();
  });
}
onBeforeRouteUpdate((guard) => loadData(guard));
</script>

<style></style>
