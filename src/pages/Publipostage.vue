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
            <li class="breadcrumb-item active" aria-current="page">
              Publipostage
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-8">
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Publipostage</h3>
          </div>
          <div class="card-body">
            <h4 class="h5">Télécharger fichier Excel pour publipostage.</h4>
            <button class="btn btn-primary mb-2" @click="publipostage">
              Fichier Excel
            </button>
            <!-- <p>TODO: Aide pour réaliser le publipostage</p> -->
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Options</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-outline-primary mb-2" @click="select">
              Sélection des sapeurs
            </button>

            <h4 class="h5">Sélection actuel</h4>
            <p v-if="sapeurIds.length <= 0">Sapeurs actifs (défault)</p>
            <p v-else>{{ sapeurIds.length }} sapeurs sélectionnés</p>
            <button
              v-if="sapeurIds.length > 0"
              class="btn btn-outline-secondary"
              @click="resetSelection"
            >
              Annuler la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';
import PublipostageService from '@/services/PublipostageService';
import store from '@/store/index';

function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'publipostage',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      sapeurIds: [],
    };
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    publipostage() {
      PublipostageService.downloadExcel(this.sapeurIds);
    },
    select() {
      const svm = this;
      const data = this.sapeurIds.slice(0);
      const callback = (res) => {
        if (!!res) {
          svm.sapeurIds = res.tous;
        }
        return Promise.resolve();
      };
      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 1,
        callback,
        data,
      });
    },
    resetSelection() {
      this.sapeurIds = [];
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
