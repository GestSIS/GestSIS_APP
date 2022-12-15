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
            @click="imputer()"
          >
            Tout imputer
          </button>
          <button
            v-if="selectedItem?.ecritures?.length"
            class="btn btn-outline-danger"
            @click="annulerImputer()"
          >
            Annuler les imputations
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
              display-key="nom_prenom"
              base-option="&lt;Sapeur&gt;"
              :options="filteredSapeurs"
              @update:model-value="(value) => onFilter('sapeur_id', value)"
            />
            <base-select
              class="mb-1 col-md-4"
              :options="filteredTravailTypes"
              base-option="<Type>"
              @update:model-value="
                (value) => onFilter('travail_type_id', value)
              "
            />
            <base-select
              class="col-md-4"
              base-option="<Statut>"
              :options="[
                { id: [-1], designation: 'Refusé' },
                { id: 0, designation: 'En attente' },
                { id: 1, designation: 'Accepté' },
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
          <h3 class="card-title">Cours</h3>
        </div>
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :class="{ 'd-none': loading }"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucun travail à afficher"
          :data="filteredData"
          :selectable="true"
          @selected="selected"
        >
          <template #actions="props">
            <button
              v-if="props.rowData.ecritures?.length"
              class="btn btn-outline-primary border-0"
              title="Annuler imputation"
              @click="annulerImputer(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'ban']" />
            </button>
            <button
              v-if="!props.rowData.ecritures?.length"
              class="btn btn-outline-primary border-0"
              title="Imputer travail"
              @click="imputer(props.rowData.id)"
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
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      loading: true,
      filters: {},
      selectedId: null,
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Travail', key: 'travail_type' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Unité', key: 'unite' },
        { title: 'Auteur', key: 'auteur' },
        { title: 'Date demande', key: 'date_demande', type: Date },
        {
          title: 'Statut',
          key: 'statut',
          formatter(statut) {
            return { [-1]: 'Refusé', 0: 'En attente', 1: 'Accepté' }[statut];
          },
        },
        { title: 'Justification', key: 'justification' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      travaux: (state) => state.travail.liste,
      sapeurs: (state) => state.sapeur.liste,
      travailTypes: (state) => state.travailType.liste,
    }),
    computedData() {
      return this.travaux.map((e) => ({
        ...e,
        categorie: this.categories.find((c) => c.id == e.exercice_categorie_id)
          ?.designation,
        localite: this.localites.find((l) => l.id == e.localite_id)
          ?.designation,
        nom_prenom: this.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        getData: () => Promise.resolve(e.ecritures),
      }));
    },
    filteredData() {
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
    filteredSapeurs() {
      const ids = new Set(this.travaux.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
    filteredTravailTypes() {
      const ids = new Set(this.travaux.map((i) => i.travail_type_id));
      return this.travailTypes.filter((t) => ids.has(t.id));
    },
    selectedItem() {
      return this.travaux.find((c) => c.id == this.selectedId);
    },
  },
  watch: {
    activeExerciceComptableId() {
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
      store.dispatch('fetchTravaux').then(() => {
        this.loading = false;
      });
    },
    selected(item) {
      this.selectedId = item?.id;
    },
    imputer(travailId) {
      const ids = travailId ? [travailId] : this.travaux.map((t) => t.id);
      this.SHOW_MODAL({
        component: 'ModalImputerTravail',
        data: { ids },
        size: 2,
        callback: () => this.init(),
      });
    },
    annulerImputer(travailId) {
      const ids = travailId ? [travailId] : this.travaux.map((t) => t.id);
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
              .dispatch('annulerImputationTravail', { ids })
              .then((res) => {
                this.$awn.success(res?.message ?? 'Travaux imputé avec succès');
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

      return dataItem?.ecritures?.length > 0
        ? 'table-success'
        : 'table-warning';
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
