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
          <!-- <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'mon-dashboard' }"
            >Tableau de bord</router-link
          > -->
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
            :to="{ name: 'mes-decomptes' }"
            >Mes décomptes</router-link
          >
          <!-- <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'mat-perso-inventaire' }"
            >Inventaire</router-link
          > -->
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <div class="col-12">
              <router-view />
            </div>
            <!-- <div class="row">
              <div v-if="false" class="col-12">
                <mes-infos />
              </div>
              <div class="col-12">
                <mes-exercices />
              </div>
              <div class="col-12">
                <mes-decomptes />
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExercicesComptables]).then(() => {
    next();
  });
}

export default {
  name: 'PageMesInfos',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  components: { ExerciceComptable },
};
</script>
