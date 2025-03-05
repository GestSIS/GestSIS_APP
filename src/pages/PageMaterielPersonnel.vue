<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 col-12">
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
      <div class="col-12 col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header">
            <h5>Filtre matériel type</h5>
          </div>
          <materiel-type-categorie-select @change="selectedTypes" />
        </div>
      </div>
      <div class="col-md-9">
        <div class="row">
          <div class="col-md-6">
            <div class="card card-primary card-outline mb-2">
              <div class="card-header d-flex justify-content-between">
                <h5>Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 col-md-6 mb-2">
                    <button class="btn btn-primary col-12" @click="attribuer">
                      Attribuer
                    </button>
                  </div>
                  <div class="col-12 col-md-6">
                    <button
                      class="btn btn-primary col-12"
                      @click="modifierInventaire"
                    >
                      Modifier l'inventaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-primary card-outline mb-2">
              <div class="card-header d-flex justify-content-between">
                <h5>Evénements</h5>
              </div>
              <div class="card-body">
                <button
                  v-for="(event, index) in eventTypes"
                  :key="index"
                  class="btn btn-outline-secondary me-2 mb-2"
                  @click="newEvent(event)"
                >
                  {{ event.nom }}
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <base-navigation-tab
              :routes="[
                {
                  to: { name: 'mat-perso-dashboard' },
                  texte: 'Tableau de bord',
                },
                {
                  to: { name: 'mat-perso-materiel' },
                  texte: 'Matériel distribué',
                },
                { to: { name: 'mat-perso-inventaire' }, texte: 'Inventaire' },
              ]"
            />
            <div id="nav-tabContent" class="tab-content">
              <div class="tab-pane fade show active" role="tabpanel">
                <router-view :selected-ids="selectedIds" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import store from '/src/store/index';

import MaterielTypeCategorieSelect from '/src/components/MATERIEL/MaterielTypeCategorieSelect.vue';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadMaterielEventTypes = store.dispatch('fetchMatPersoEventTypes');
  const loadMaterielTypes = store.dispatch('fetchMaterielTypes');
  const loadMaterielCategories = store.dispatch('fetchMatPersoCategories');

  Promise.all([
    loadSapeurs,
    loadMaterielTypes,
    loadMaterielCategories,
    loadMaterielEventTypes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageMaterielPersonnel',
  components: { MaterielTypeCategorieSelect },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      selectedIds: {
        type: {},
        categorie: {},
      },
    };
  },
  computed: {
    ...mapState({
      eventTypes: (state) => state.matPersoEventType.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectedTypes(types) {
      this.selectedIds = types;
    },
    attribuer() {
      this.SHOW_MODAL({
        component: 'ModalAttributionMultiple',
        size: 1,
      });
    },
    modifierInventaire() {
      this.SHOW_MODAL({
        component: 'ModalInventaire',
        size: 2,
      });
    },
    newEvent(event) {
      this.SHOW_MODAL({
        component: 'ModalMatPersoEvent',
        size: 1,
        data: {
          materiel_event_type_id: event.id,
        },
      });
    },
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
