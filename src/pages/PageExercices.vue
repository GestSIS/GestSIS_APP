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
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'exercices' }"
            >Exercices</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'absences' }"
            >Absences</router-link
          >
        </nav>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import store from '/src/store/index';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

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

export default {
  name: 'PageExercices',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
</script>

<style></style>
