<template>
  <div class="row">
    <div class="col-12 col-md-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            v-if="!selectedItem || !selectedItem?.ecritures?.length"
            class="btn btn-outline-primary"
            :disabled="!selectedItem"
            @click="imputer(selectedItem.id)"
          >
            Imputer
          </button>
          <button
            v-if="selectedItem?.ecritures?.length"
            class="btn btn-outline-danger"
            @click="annulerImputer(selectedItem.id)"
          >
            Annuler l'imputation
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
              base-option="&lt;Cours&gt;"
              :options="filteredCoursTypes"
              @update:model-value="(value) => onFilter('cours_id', value)"
            />
            <base-select
              class="col-md-4"
              value-key="id"
              display-key="nom_prenom"
              base-option="&lt;Sapeur&gt;"
              :options="filteredSapeurs"
              @update:model-value="(value) => onFilter('sapeur_id', value)"
            />
            <base-select
              class="col-md-4"
              value-key="id"
              display-key="designation"
              base-option="&lt;Localité&gt;"
              :options="filteredLocalites"
              @update:model-value="(value) => onFilter('localite_id', value)"
            />
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3 table-responsive">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Cours</h3>
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
          detail-row-class="m-td-0"
          no-data="Aucune écriture à afficher"
          :detail-row-component="detailRow"
          :data="filteredCours"
          :selectable="true"
          @selected="selected"
        >
          <template #details="props">
            <button
              v-if="props.rowData.ecritures.length"
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
          </template>
          <template #actions="props">
            <button
              v-if="props.rowData.ecritures.length"
              class="btn btn-outline-primary border-0"
              title="Annuler imputation"
              @click="annulerImputer(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'ban']" />
            </button>
            <button
              v-if="!props.rowData.ecritures.length"
              class="btn btn-outline-primary border-0"
              title="Imputer cours"
              @click="imputer(props.rowData.id, props.rowData.designation)"
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

async function loadData(_, next) {
  const loadCategories = store.dispatch('fetchEcritureCategories');
  const loadUnites = store.dispatch('fetchUnites');
  const loadCours = store.dispatch('fetchCours');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadComptes = store.dispatch('fetchComptes');

  Promise.all([
    loadCategories,
    loadUnites,
    loadCours,
    loadSapeurs,
    loadLocalites,
    loadIndemnites,
    loadComptes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabCours',
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
      detailRow: markRaw(FraisEcritureDetails),
      loading: true,
      filters: {},
      selectedItem: null,
      ecritureColumns: [
        {
          title: 'Sapeur',
          field: 'sapeur_id',
          formatter: (sapeurId) =>
            svm.sapeurs.find((e) => e.id === sapeurId)?.nom_prenom,
        },
        {
          title: 'Type',
          field: 'type',
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
          title: 'Unite',
          field: 'type_unite_id',
          formatter: (type_unite_id) =>
            svm.unites.find((u) => u.id == type_unite_id)?.unite,
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
          formatter(value) {
            return new Date(value).toLocaleDateString('fr-CH');
          },
        },
        {
          title: 'Cours',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Sapeur',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Durée [jour]',
          key: 'duree',
          sortKey: 'duree',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
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
      cours: (state) => state.cours.liste,
      unites: (state) => state.unite.liste,
      coursSapeurs: (state) =>
        state.coursSapeur.liste.map((e) => ({ ...e.cours, ...e })),
      sapeurs: (state) => state.sapeur.liste,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      return this.coursSapeurs.map((e) => ({
        ...e,
        categorie: this.categories.find((c) => c.id == e.exercice_categorie_id)
          ?.designation,
        localite: this.localites.find((l) => l.id == e.localite_id)
          ?.designation,
        columns: this.ecritureColumns,
        nom_prenom: this.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        getEcritures: () => Promise.resolve(e.ecritures),
      }));
    },
    filteredCours() {
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
      const ids = new Set(this.coursSapeurs.map((i) => i.localite_id));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredSapeurs() {
      const ids = new Set(this.coursSapeurs.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
    filteredCoursTypes() {
      const ids = new Set(this.coursSapeurs.map((i) => i.cours_id));
      return this.cours.filter((t) => ids.has(t.id));
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
      store.dispatch('fetchCoursSapeurs').then(() => {
        this.loading = false;
      });
    },
    selected(item) {
      this.selectedItem = item;
    },
    imputer(courSapeurId) {
      this.SHOW_MODAL({
        component: 'ModalImputerCours',
        data: { id: courSapeurId },
        size: 2,
        callback: () => this.init(),
      });
    },
    annulerImputer(courSapeurId) {
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
              .dispatch('annulerImputationCours', courSapeurId)
              .then(({ statut }) => {
                this.coursSapeurs = [
                  ...this.coursSapeurs.filter((e) => e.id != courSapeurId),
                  {
                    ...this.coursSapeurs.find((e) => e.id == courSapeurId),
                    statut: statut,
                  },
                ].sort((a, b) => a.date.localeCompare(b.date));
                this.selectedItem = this.coursSapeurs.find(
                  (e) => e.id == courSapeurId
                );
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

      return dataItem.ecritures.length > 0 ? 'table-success' : 'table-warning';
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
