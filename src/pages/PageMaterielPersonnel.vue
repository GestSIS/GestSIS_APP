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
              Matériel personnel
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
            :to="{ name: 'mat-perso-dashboard' }"
            >Tableau de bord</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'mat-perso-materiel' }"
            >Attribution</router-link
          >
          <router-link
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'mat-perso-inventaire' }"
            >Inventaire</router-link
          >
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMateriel = store.dispatch('fetchMatPerso');
  let loadMaterielTypes = store.dispatch('fetchMatPersoTypes');
  let loadMaterielARecuperer = store.dispatch('fetchMatPersoARecuperer');
  let loadMaterielAlertes = store.dispatch('fetchMatPersoAlertes');
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([
    loadSapeurs,
    loadMateriel,
    loadMaterielARecuperer,
    loadMaterielAlertes,
    loadMaterielTypes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageMaterielPersonnel',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
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
