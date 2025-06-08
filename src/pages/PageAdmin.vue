<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Admin</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'admin-sis' }, texte: 'Sis' },
            { to: { name: 'admin-users' }, texte: 'Utilisateurs' },
          ]"
        />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <div class="col-12">
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExercicesComptables]).then(() => {
    next();
  });
}

export default {
  name: 'PageAdmin',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  // components: { ExerciceComptable },
};
</script>
