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
              Mes infos
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
            :to="{ name: 'mes-infos' }"
            >Mes infos</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-exercices' }"
            >Mes exercices</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-interventions' }"
            >Mes interventions</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mon-materiel' }"
            >Mon matériel</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-travaux' }"
            >Ma fiche de travail</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-decomptes' }"
            >Mes décomptes</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-cours' }"
            >Mes cours</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-fonctions' }"
            >Mes fonctions</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-grades' }"
            >Mes grades</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-groupes' }"
            >Mes groupes</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-mutations' }"
            >Mes mutations</router-link
          >
        </nav>
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
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  let loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExercicesComptables]).then(() => {
    next();
  });
}

export default {
  name: 'PageMesInfos',
  components: { ExerciceComptable },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
</script>
