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
    </div>

    <div class="row">
      <div class="col-md-12">
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'mes-infos' }"
            >Tableau de bord</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mes-infos' }"
            >Mes infos</router-link
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
            <router-view />
            <div class="row">
              <div class="col-12">
                <mes-infos />
              </div>
              <div class="col-12">
                <mes-exercices />
              </div>
              <div class="col-12">
                <mes-decomptes />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';

import MesDecomptes from '../components/mes_infos/MesDecomptes.vue';
import MesExercices from '../components/mes_infos/MesExercices.vue';
import MesInfos from '../components/mes_infos/MesInfos.vue';

async function loadData(routeTo, next) {
  let loadMesInfos = store.dispatch('fetchMesInfos');
  let loadMesExercices = store.dispatch('fetchMesExercices');
  let loadMesDecomptes = store.dispatch('fetchMesDecomptes');
  let loadlocalites = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([
    loadMesInfos,
    loadMesDecomptes,
    loadMesExercices,
    loadlocalites,
    loadExerciceCategories,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageMesInfos',
  components: { MesInfos, MesExercices, MesDecomptes },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
</script>
