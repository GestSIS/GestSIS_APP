<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">Sapeurs</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body px-0">
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutActif"
                  name="actif"
                  class="form-check-input"
                  value="actif"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutActif">Actif</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutInactif"
                  name="actif"
                  class="form-check-input"
                  value="inactif"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutInactif"
                  >Inactif</label
                >
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  id="statutTous"
                  name="actif"
                  class="form-check-input"
                  value="all"
                  v-model="filter"
                />
                <label class="form-check-label" for="statutTous">Tous</label>
              </div>
            </div>
          </div>
          <ul class="list-group list-group-flush" id="liste-sapeurs">
            <router-link
              v-for="sapeur in filteredSapeurs"
              tag="li"
              :to="`/sapeurs/${sapeur.id}`"
              :key="sapeur.id"
              class="list-group-item list-group-item-action"
              :class="{
                active: activeSapeurId === sapeur.id,
              }"
            >
              {{ sapeur.nom }} {{ sapeur.prenom }}
            </router-link>
            <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              Aucun sapeur
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-9">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';

import { mapState } from 'vuex';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

const redirectToLastestOpennedSapeur = (routeTo, routeFrom, next) => {
  if (
    (!('id' in routeTo.params) || !routeTo.params.id) &&
    store.state.sapeur.active.id > 0
  ) {
    // Redirection dans le cas ou on a déjà sélectionné un sapeur
    next({
      name: 'sapeurs-details',
      params: { id: store.state.sapeur.active.id },
    });
  } else if (
    (!('id' in routeTo.params) || !routeTo.params.id) &&
    store.state.sapeur.liste.length > 0
  ) {
    // Sélection du premier sapeur
    store.dispatch('selectSapeur', store.state.sapeur.liste[0].id);
    next({
      name: 'sapeurs-details',
      params: { id: store.state.sapeur.liste[0].id },
    });
  } else {
    next();
  }
};

export default {
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    redirectToLastestOpennedSapeur(routeTo, routeFrom, next);
  },
  beforeCreate() {
    this.$store.dispatch('fetchListeSapeur').then(() => {
      if (
        store.state.sapeur.active.id <= 0 &&
        store.state.sapeur.liste.length > 0
      ) {
        store.dispatch('selectSapeur', store.state.sapeur.liste[0].id);
        this.$router.push({
          name: 'sapeurs-details',
          params: { id: store.state.sapeur.liste[0].id },
        });
      }
    });
  },
  data() {
    return {
      filter: 'actif',
      filters: {
        actif: (s) => s.actif === 1,
        inactif: (s) => s.actif === 0,
        all: () => true,
      },
    };
  },
  computed: {
    ...mapState({
      listeSapeur: (state) => state.sapeur.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
    }),
    filteredSapeurs() {
      return this.listeSapeur.filter(this.filters[this.filter]);
    },
  },
};
</script>

<style lang="scss" scoped>
#liste-sapeurs {
  li {
    padding: 0.25rem 0.75rem;
  }
}
</style>
