<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
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
          <base-table
            v-show="!loading"
            ref="basetable_exercices"
            :selectable="true"
            selectKey="id"
            row-selected-class="table-primary"
            :fields="fieldsBase"
            :detail-row-component="detailRow"
            detail-row-class="m-td-0"
            no-data="Aucun exercice/séance à afficher"
            :data="computedData"
            :row-class="onRowClass"
            @selected="selectExercice"
          >
            <div slot="details" slot-scope="props" class="d-flex">
              <button
                class="btn btn-link border-0"
                @click="props.actions.toggleDetailRow(props.rowData.id)"
              >
                <font-awesome-icon
                  v-if="props.status.detailRowVisible || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!props.status.detailRowVisible || false"
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
                v-if="hasValidationPermission && props.rowData.statut == 2"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
            </div>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import store from '@/store/index';
import permissions from '@/store/permissions.js';

import ExerciceDetails from '@/components/exercice/ExerciceDetails';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

import ExerciceService from '@/services/ExerciceService';

import BaseTable from '@/components/table/BaseTable.vue';

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
    BaseTable,
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
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      selectedId: null,
      filters: {},
      detailRow: ExerciceDetails,
      fieldsBase: [
        {
          title: '',
          key: 'details',
          slot: 'details',
          dataClass: 'details-width',
        },
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
        },
        {
          title: 'Categorie',
          key: 'categorie',
          sortKey: 'categorie',
        },
        {
          title: 'Heure',
          key: 'heure',
          sortKey: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        {
          title: 'Duree',
          key: 'duree',
          sortKey: 'duree',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          sortKey: 'lieu',
        },
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Statut',
          key: 'statut',
          sortKey: 'statut',
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
          key: 'actions',
          slot: 'actions',
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
      hasValidationPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
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
      const ids = new Set(
        this.listeExercices.map((i) => i.exercice_categorie_id)
      );
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
          .map(
            ([key, value]) =>
              (x) =>
                x[key] === value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
  },
  methods: {
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    selectExercice(row) {
      this.selectedId = row?.id;
    },
    listePresences({ id }) {
      ExerciceService.downloadListPresence(id, 'liste-presence.pdf');
    },
    listeAppel({ id }) {
      ExerciceService.downloadListAppel(id, 'liste-appel.pdf');
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return '';
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
