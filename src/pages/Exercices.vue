<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Exercices
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <form class="card-body">
            <router-link
              tag="button"
              to="/exercices/new"
              class="btn btn-outline-primary btn-block"
            >
              Ajouter un exercice
            </router-link>
            <router-link
              tag="button"
              :disabled="!selectedId"
              :to="'/exercices/' + selectedId"
              class="btn btn-outline-primary btn-block"
            >
              Modifier
            </router-link>
          </form>
        </div>
      </div>
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <form class="card-body">
            <button
              :disabled="!selectedId"
              @click="listePresences({ id: selectedId })"
              class="btn btn-outline-primary btn-block"
            >
              Liste de présences
            </button>
            <button
              :disabled="!selectedId"
              @click="listeAppel({ id: selectedId })"
              class="btn btn-outline-primary btn-block"
            >
              Liste d'appel
            </button>
          </form>
        </div>
      </div>
      <div class="col-md-6">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <form class="card-body">
            <div class="form-row">
              <div class="form-group col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterLocalite"
                  @change="
                    (event) => onFilter('localite_id', event.target.value)
                  "
                >
                  <option>&lt;Localité&gt;</option>
                  <option
                    v-for="loc in filteredLocalites"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.designation }}
                  </option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterCategorie"
                  @change="
                    (event) =>
                      onFilter('exercice_categorie_id', event.target.value)
                  "
                >
                  <option>&lt;Catégorie&gt;</option>
                  <option
                    v-for="catgeorie in filteredExercicesCategories"
                    :key="catgeorie.id"
                    :value="catgeorie.id"
                  >
                    {{ catgeorie.designation }}
                  </option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterStatus"
                  @change="
                    (event) => onFilter('statut', parseInt(event.target.value))
                  "
                >
                  <option value="-1">&lt;Statut&gt;</option>
                  <option value="0">Annulé</option>
                  <option value="1">Sapeurs à ajouter</option>
                  <option value="2">En attente de validation</option>
                  <option value="3">A imputer</option>
                  <option value="4">Imputée</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5">
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <vuetable
            v-show="!loading"
            ref="vuetable_exercices"
            :api-mode="false"
            :fields="fields"
            :detail-row-component="detailRow"
            detail-row-class="m-td-0"
            :css="css.table"
            :data-manager="dataManager"
            :row-class="onRowClass"
            no-data-template="Aucun exercice/séance à afficher"
            @vuetable:row-clicked="selectExercice"
          >
            <div slot="details" slot-scope="props" class="d-flex">
              <button
                class="btn btn-link border-0"
                @click="toggleDetails(props.rowData.id)"
              >
                <font-awesome-icon
                  v-if="toggles[props.rowData.id] || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!(toggles[props.rowData.id] || false)"
                  :icon="['fas', 'angle-right']"
                />
              </button>
            </div>
            <div slot="actions" slot-scope="props" class="d-flex">
              <router-link
                tag="button"
                :to="'/exercices/' + props.rowData.id"
                class="btn btn-outline-primary border-0"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </router-link>
              <button
                class="btn btn-outline-primary border-0"
                @click="validerExercice(props.rowData.id)"
                v-if="props.rowData.statut === 2"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
            </div>
          </vuetable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import store from '@/store/index';

import ExerciceDetails from '@/components/exercice/ExerciceDetails';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

import ExerciceService from '@/services/ExerciceService';

import Vuetable from 'vuetable-2';
// import VuetableRowHeader from 'vuetable-2/src/components/VuetableRowHeader.vue'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

async function loadData(routeTo, next) {
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');

  await store.dispatch('fetchExercicesComptables');

  let loadExercices = store.dispatch('fetchListeExercice');
  Promise.all([loadExercices, loadLocalities, loadExerciceCategories]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'exercices',
  components: {
    Vuetable,
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeExercice').then(() => {
        this.loading = false;
        this.$refs.vuetable_exercices.setData(this.filteredExercices);
      });
    },
    filteredExercices(data) {
      this.loading = false;
      this.$refs.vuetable_exercices.setData(data);
    },
  },
  mounted() {
    this.$refs.vuetable_exercices.setData(this.filteredExercices);
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      selectedId: null,
      filters: {},
      css: CssForBootstrap4,
      toggles: {},
      detailRow: ExerciceDetails,
      fields: [
        {
          title: '',
          name: 'details',
          dataClass: 'details-width',
        },
        {
          title: 'Date',
          name: 'date',
          sortField: 'date',
        },
        {
          title: 'Categorie',
          name: 'categorie',
          sortField: 'categorie',
        },
        {
          title: 'Heure',
          name: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        {
          title: 'Duree',
          name: 'duree',
          sortField: 'duree',
        },
        {
          title: 'Localité',
          name: 'localite',
          sortField: 'localite',
        },
        {
          title: 'Lieu',
          name: 'lieu',
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
        },
        {
          title: 'Statut',
          name: 'statut',
          sortField: 'statut',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'A imputer',
              4: 'Imputée',
            };
            return statuts[value];
          },
        },
        {
          title: 'Actions',
          name: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      listeExercices: (state) => state.exercice.liste,
      listeCategories: (state) => state.exerciceCategorie.liste,
      listeLocalites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['activeExerciceId', 'getExerciceCategorie', 'getLocalite']),
    computedData() {
      return this.listeExercices.map((s) => ({
        ...s,
        categorie: this.getExerciceCategorie(s.exercice_categorie_id)
          .designation,
        localite: this.getLocalite(s.localite_id).designation,
      }));
    },
    filteredExercicesCategories() {
      const ids = new Set(this.listeExercices.map((i) => i.exercice_categorie_id));
      return this.listeCategories.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(this.listeExercices.map((i) => i.localite_id));
      return this.listeLocalites.filter((t) => ids.has(t.id));
    },
    filteredExercices() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0)
          .map(([key, value]) => (x) => x[key] === value)
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
  },
  methods: {
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id],
      };
      this.$refs.vuetable_exercices.toggleDetailRow(id);
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    selectExercice(row) {
      this.selectedId = row.data.id;
    },
    listePresences({ id }) {
      ExerciceService.downloadListPresence(id, 'liste-presence.pdf');
    },
    listeAppel({ id }) {
      ExerciceService.downloadListAppel(id, 'liste-appel.pdf');
    },
    dataManager(sortOrder) {
      if (this.computedData.length < 1) return;

      let local = this.computedData;

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        local = _.orderBy(
          local,
          sortOrder[0].sortField,
          sortOrder[0].direction
        );
      }

      return {
        data: local,
      };
    },
    onRowClass(dataItem) {
      if (dataItem.id === this.selectedId) {
        return 'table-primary';
      }

      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: '', //'A imputer',
        4: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}
.m-td-0 > td {
  padding: 0 !important;
}
</style>
