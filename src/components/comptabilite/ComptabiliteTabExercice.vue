<template>
  <div class="row">
    <div class="col-12 col-md-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            v-if="!selectedItem || selectedItem?.statut == 3"
            class="btn btn-outline-primary"
            :disabled="!selectedItem"
            @click="imputer(selectedItem.id)"
          >
            Imputer
          </button>
          <button
            v-if="selectedItem?.statut == 4"
            class="btn btn-outline-danger"
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
              value-key="id"
              display-key="designation"
              base-option="&lt;Localité&gt;"
              :options="filteredLocalites"
              @update:model-value="(value) => onFilter('localite_id', value)"
            />
            <base-select
              class="col-md-4"
              value-key="id"
              display-key="designation"
              base-option="&lt;Catégorie&gt;"
              :options="filteredCategories"
              @update:model-value="
                (value) => onFilter('exercice_categorie_id', value)
              "
            />
            <base-select
              class="col-md-4"
              value-key="id"
              display-key="designation"
              base-option="&lt;Statut&gt;"
              :options="[
                { id: '3', designation: 'Validé' },
                { id: '4', designation: 'Imputé' },
              ]"
              @update:model-value="(value) => onFilter('statut', value)"
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
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucune écriture à afficher"
          :detail-row-column="true"
          :detail-row-column-hide-button="(r) => r.statut !== 4"
          :detail-row-component="detailRowComponent"
          :detail-row-options="detailRowOptions"
          detail-row-class="m-td-0"
          :data="filteredExercices"
          :selectable="true"
          @selected="selected"
        >
          <template #actions="props">
            <button
              v-if="props.rowData.statut === 3"
              class="btn btn-outline-primary border-0"
              @click="imputer(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
            <button
              v-if="props.rowData.statut === 4"
              class="btn btn-outline-primary border-0"
              title="Décompte sapeur"
              :disabled="!props.rowData.aPayer"
              @click="
                genererDecompteExercice(
                  props.rowData.id,
                  props.rowData.designation
                )
              "
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

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import ImputationService from '@/services/ImputationService.js';

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
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    let svm = this;
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      loading: true,
      exercices: [],
      filters: {},
      selectedItemId: null,
      detailRowOptions: {
        fields: [
          {
            title: 'Sapeur',
            key: 'sapeur_id',
            formatter: (sapeurId) =>
              svm.sapeurs.find((e) => e.id === sapeurId)?.nom_prenom,
          },
          {
            title: 'Type',
            key: 'type',
            formatter: (type) => {
              const mapping = {
                0: 'Autre',
                1: 'Solde',
                2: 'Indemnité',
                3: 'Frais forfaitaire',
                4: 'Frais effectif',
                5: 'Charges AVS/AC',
              };
              return mapping[type] || '';
            },
          },
          {
            title: 'Tarif',
            key: 'tarif',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Quantite',
            key: 'quantite',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Amende',
            key: 'total',
            formatter: (total, ecriture) =>
              ecriture.module == 5 ? ecriture.total : '0.00',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Total',
            key: 'total',
            formatter: (total, ecriture) =>
              ecriture.module == 5 ? (-total).toFixed(2) : total,
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
        ],
      },
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          type: Date,
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
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    selectedItem() {
      return this.exercices.find((e) => e.id == this.selectedItemId);
    },
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
            ?.designation,
          aPayer,
          getData: () => Promise.resolve(e.ecritures),
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
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.init();
    },
  },
  mounted() {
    this.loading = true;
    this.init();
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    init() {
      ImputationService.getExerciceEcriturePourExerciceComptable(
        this.currentExerciceComptableId
      ).then((e) => {
        this.exercices = [...e].sort((a, b) => a.date.localeCompare(b.date));
        this.loading = false;
      });
    },
    selected(item) {
      this.selectedItemId = item?.id;
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
              })
              .catch((err) => {
                this.$awn.alert(
                  err?.message ?? "Erreur impossible d'annuler l'imputation"
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
