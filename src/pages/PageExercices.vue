<script setup>
import store from '/src/store/index';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { onBeforeRouteUpdate } from 'vue-router';

async function loadData(routeTo, next) {
  const loadLocalities = store.dispatch('fetchLocalites');
  const loadExerciceCategories = store.dispatch('fetchExerciceCategories');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadExerciceComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([
    loadSapeurs,
    loadLocalities,
    loadExerciceCategories,
    loadExerciceComptables,
  ]).then(() => {
    next();
  });
}

onBeforeRouteUpdate(loadData);
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Exercices
            </li>
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
            { to: { name: 'exercices' }, texte: 'Exercices' },
            { to: { name: 'exercices-absences' }, texte: 'Absences' },
          ]"
        />
      </div>
    </div>
    <router-view />
  </div>
</template>
