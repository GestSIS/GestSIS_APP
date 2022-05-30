<template>
  <div class="row">
    <div class="col-12 col-md-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            class="btn btn-outline-primary"
            v-if="!selectedItem || selectedItem?.statut == 3"
            :disabled="!selectedItem"
            @click="imputer(selectedItem.id)"
          >
            Imputer
          </button>
          <button
            class="btn btn-outline-danger"
            v-if="selectedItem?.statut == 4"
            @click="annulerImputer(selectedItem.id)"
          >
            Annuler l'imputation
          </button>
          <button
            class="btn btn-outline-primary"
            :disabled="selectedItem?.statut != 4"
            @click="
              genererDecompteExercice(selectedItem.id, selectedItem.designation)
            "
          >
            Créer un décompte
          </button>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-8 col-xl-9">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Filtres</h3>
        </div>
        <form class="card-body">
          <div class="row">
            <base-select
              class="col-md-4"
              valueKey="id"
              displayKey="designation"
              baseOption="&lt;Localité&gt;"
              :options="filteredLocalites"
              @input="(value) => onFilter('localite_id', value)"
            />
            <base-select
              class="col-md-4"
              valueKey="id"
              displayKey="designation"
              baseOption="&lt;Catégorie&gt;"
              :options="filteredCategories"
              @input="(value) => onFilter('exercice_categorie_id', value)"
            />
            <base-select
              class="col-md-4"
              valueKey="id"
              displayKey="designation"
              baseOption="&lt;Statut&gt;"
              :options="[
                { id: '3', designation: 'Validé' },
                { id: '4', designation: 'Imputé' },
              ]"
              @input="(value) => onFilter('statut', value)"
            />
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3 table-responsive">
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
          </template>
          <template v-slot:actions="props">
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 3"
              @click="imputer(props.rowData.id)"
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
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';

import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails.vue';
import ImputationService from '@/services/ImputationService.js';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(_, next) {
  const loadExercices = store.dispatch('fetchListeExercice');
  const loadCategories = store.dispatch('fetchExerciceCategories');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadComptes = store.dispatch('fetchComptes');

  Promise.all([
    loadExercices,
    loadCategories,
    loadSapeurs,
    loadLocalites,
    loadIndemnites,
    loadComptes,
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
      detailRow: markRaw(FraisEcritureDetails),
      loading: true,
      exercices: [],
      filters: {},
      selectedItem: null,
      ecritureColumns: [
        {
          title: 'Sapeur',
          field: 'sapeur_id',
          formatter: (sapeurId) => {
            const sapeur = svm.sapeurs.find((e) => e.id === sapeurId);
            return `${sapeur.nom} ${sapeur.prenom}`;
          },
        },
        {
          title: 'Tarif',
          field: 'tarif',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Quantite',
          field: 'quantite',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Amende',
          field: 'total',
          formatter: (total, ecriture) =>
            ecriture.module == 5 ? ecriture.total : '0.00',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Total',
          field: 'total',
          formatter: (total, ecriture) =>
            ecriture.module == 5 ? (-total).toFixed(2) : total,
          headerClassName: 'text-center',
          className: 'text-end',
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
              3: 'Validé',
              4: 'Imputé',
            };
            return statuts[value];
          },
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
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
      sapeurs: (state) => state.sapeur.liste,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      return this.exercices.map((e) => {
        let aPayer = e.statut == 4;
        if (e.statut == 4) {
          aPayer = e.ecritures.findIndex((i) => i.decompte_id == null) >= 0;
        }
        return {
          ...e,
          categorie: this.categories.find(
            (c) => c.id == e.exercice_categorie_id
          )?.designation,
          localite: this.localites.find((l) => l.id == e.localite_id)
            .designation,
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
        this.exercices = [...e].sort((a, b) => a.date.localeCompare(b.date));
        this.selectedItem =
          this.exercices.find((e) => e.id == this.selectedItem?.id) || null;
        this.loading = false;
      });
    },
    selected(item) {
      this.selectedItem = item;
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
    imputer(exerciceId) {
      this.SHOW_MODAL({
        component: 'ModalImputerExercice',
        data: { id: exerciceId },
        size: 2,
        callback: () => this.init(),
      });
    },
    annulerImputer(exerciceId) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette imputation ?',
          question:
            "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau cet exercice.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('annulerImputationExercice', exerciceId)
              .then(({ statut }) => {
                this.exercices = [
                  ...this.exercices.filter((e) => e.id != exerciceId),
                  {
                    ...this.exercices.find((e) => e.id == exerciceId),
                    statut: statut,
                  },
                ].sort((a, b) => a.date.localeCompare(b.date));
                this.selectedItem = this.exercices.find(
                  (e) => e.id == exerciceId
                );
              });
          }
        },
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
        3: 'table-warning', //'Validé',
        4: 'table-success', //'Imputé'
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
