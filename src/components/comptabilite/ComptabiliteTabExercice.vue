<template>
  <div class="row">
    <div class="col-sm-12 col-xl-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-outline-primary btn-block" disabled>
            Imputer
          </button>
          <button class="btn btn-outline-primary btn-block" disabled>
            Créer un décompte
          </button>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-8">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Filtres</h3>
        </div>
        <form class="card-body">
          <div class="form-row">
            <div class="form-group col-md-4">
              <select
                class="custom-select custom-select-sm"
                id="filterLocalite"
                @change="(event) => onFilter('localite_id', event.target.value)"
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
                  v-for="catgeorie in filteredCategories"
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
                <option value="3">A imputer</option>
                <option value="4">Imputée</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Exercices</h3>
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data="Aucune écriture à afficher"
          :detail-row-component="detailRow"
          :data="filteredExercices"
          @selected="selected"
          :selectable="true"
          selectKey="id"
          row-selected-class="table-primary"
        >
          <template v-slot:details="props">
            <div class="d-flex">
              <button
                class="btn btn-link border-0"
                @click="props.actions.toggleDetailRow(props.rowData.id)"
                v-if="props.rowData.statut === 4"
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
          </template>
          <template v-slot:actions="props">
            <div class="d-flex">
              <button
                class="btn btn-outline-primary border-0"
                v-if="props.rowData.statut === 3"
                @click="imputerExercice(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
              <button
                class="btn btn-outline-primary border-0"
                v-if="props.rowData.statut === 4"
                @click="
                  genererDecompteExercice(
                    props.rowData.id,
                    props.rowData.designation
                  )
                "
                title="Décompte sapeur"
                :disabled="!props.rowData.aPayer"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import { mapState, mapGetters, mapMutations } from 'vuex';

import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';
import ImputationService from '@/services/ImputationService';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(_, next) {
  const loadExercices = store.dispatch('fetchListeExercice');
  const loadCategories = store.dispatch('fetchExerciceCategories');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');

  Promise.all([
    loadExercices,
    loadCategories,
    loadSapeurs,
    loadLocalites,
    loadIndemnites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabExercice',
  components: {
    BaseTable,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {
    this.loading = true;
    this.init();
  },
  data() {
    let svm = this;
    return {
      detailRow: FraisEcritureDetails,
      loading: true,
      exercices: [],
      filters: {},
      selectedId: null,
      ecritureColumns: [
        {
          title: 'Sapeur',
          field: 'sapeur_id',
          formatter: (field) =>
            [svm.getSapeur(field)].map((s) => `${s.nom} ${s.prenom}`)[0],
        },
        {
          title: 'Solde',
          field: 'solde',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Indemnité',
          field: 'indemnite',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Amende',
          field: 'amende',
          formatter: (amende, ecriture) => (amende ? ecriture.total : '0.00'),
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Total',
          field: 'total',
          formatter: (total, ecriture) =>
            ecriture.amende ? (-total).toFixed(2) : total,
          headerClassName: 'text-center',
          className: 'text-right',
        },
      ],
      fields: [
        {
          title: '',
          key: 'details',
          slot: 'details',
          dataClass: 'align-middle details-width',
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
          formatter(value) {
            return value.slice(0, 5);
          },
          sortKey: 'heure',
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
          title: 'statut',
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
  props: {
    id: {
      type: String,
    },
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.init();
    },
  },
  computed: {
    ...mapState({
      listSapeurs: (state) => state.sapeur.liste,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['getExerciceCategorie', 'getLocalite', 'getSapeur']),
    computedData() {
      return this.exercices.map((e) => {
        let aPayer = e.statut == 4;
        if (e.statut == 4) {
          aPayer = e.ecritures.findIndex((i) => i.decompte_id == null) >= 0;
        }
        return {
          ...e,
          categorie: this.getExerciceCategorie(e.exercice_categorie_id)
            .designation,
          localite: this.getLocalite(e.localite_id).designation,
          aPayer,
          getEcritures: () => Promise.resolve(e.ecritures),
          columns: this.ecritureColumns,
        };
      });
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
    filteredLocalites() {
      const ids = new Set(this.exercices.map((i) => i.localite_id));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredCategories() {
      const ids = new Set(this.exercices.map((i) => i.exercice_categorie_id));
      return this.categories.filter((t) => ids.has(t.id));
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    init() {
      ImputationService.getExerciceEcriturePourExerciceComptable(
        this.currentExerciceComptableId
      ).then((e) => {
        this.selectedId = null;
        this.exercices = [...e];
        this.loading = false;
      });
    },
    selected(id) {
      this.selectedId = id;
    },
    genererDecompteExercice(exerciceId, designation) {
      this.SHOW_MODAL({
        component: 'modalDecompte',
        data: {
          exerciceId,
          designation,
        },
        callback: () => this.init(),
      });
    },
    imputerExercice(exerciceId) {
      this.SHOW_MODAL({
        component: 'ModalImputerExercice',
        data: { id: exerciceId },
        size: 2,
      });
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      const statutsClass = {
        0: '', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: 'table-warning', //'A imputer',
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
.m-td-0 > td {
  padding: 0 !important;
}
</style>
