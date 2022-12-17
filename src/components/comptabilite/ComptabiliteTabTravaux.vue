<template>
  <div class="row">
    <div class="col-12 col-md-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            v-if="!selectedItem || selectedItem?.statut == 1"
            class="btn btn-outline-primary"
            :disabled="selectedItem && selectedItem.statut == 1"
            @click="imputer()"
          >
            Imputer le travail sélectionné
          </button>
          <button
            v-if="selectedItem?.statut == 2"
            class="btn btn-outline-danger"
            @click="imputer()"
          >
            Annuler l'imputation sélectionnée
          </button>
          <button class="btn btn-outline-primary" @click="imputer()">
            Tout imputer
          </button>
          <!-- <button
            v-if="selectedItem?.ecritures?.length"
            class="btn btn-outline-danger"
            @click="annulerImputer()"
          >
            Annuler toutes les imputations
          </button> -->
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
          <h3 class="card-title">Fiches de travails</h3>
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
          :detail-row-column="true"
          :detail-row-column-hide-button="(r) => r.statut !== 2"
          :detail-row-component="detailRowComponent"
          :detail-row-options="detailRowOptions"
          :data="filteredData"
          :selectable="true"
          @selected="selected"
        >
          <template #actions="{ rowData }">
            <button
              v-if="rowData.statut == 2"
              class="btn btn-outline-primary border-0"
              title="Annuler imputation"
              @click="annulerImputer(rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'ban']" />
            </button>
            <button
              v-if="rowData.statut == 1"
              class="btn btn-outline-primary border-0"
              title="Imputer travail"
              @click="imputer(rowData.id)"
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
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadTravailTypes = store.dispatch('fetchTravailTypes');
  const loadComptes = store.dispatch('fetchComptes');
  const loadTravaux = store.dispatch('fetchTravaux');

  Promise.all([
    loadCategories,
    loadUnites,
    loadTravailTypes,
    loadSapeurs,
    loadTravaux,
    loadComptes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ComptabiliteTabTravaux',
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
      detailRowOptions: {
        fields: [
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
            return {
              [-1]: 'Refusé',
              0: 'En attente',
              1: 'Accepté',
              2: 'Imputé',
            }[statut];
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
      travaux: (state) => state.travail.liste.filter((t) => t.statut >= 1),
      sapeurs: (state) => state.sapeur.liste,
      travailTypes: (state) => state.travailType.liste,
      categories: (state) => state.ecritureCategorie.liste,
      unites: (state) => state.unite.liste,
    }),
    computedData() {
      return this.travaux.map((e) => ({
        ...e,
        travail_type: this.travailTypes.find((e) => e.id == e.travail_type_id)
          ?.designation,
        sapeur: this.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        auteur: this.sapeurs.find((s) => s.id == e.auteur_id)?.nom_prenom,
        unite: this.unites.find(
          (u) =>
            u.id ==
            this.travailTypes.find((e) => e.id == e.travail_type_id)
              ?.type_unite_id
        )?.unite,
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
      const ids = travailId
        ? [travailId]
        : this.travaux.filter((t) => t.statut == 1).map((t) => t.id);

      if (!ids.length) {
        this.$awn.warning('Aucun travail à impossible');
        return;
      }

      this.$store
        .dispatch('imputerTravail', ids)
        .then((res) => {
          this.$store.dispatch('fetchTravaux');
          this.$awn.success(res?.message ?? 'Travaux imputé avec succès');
        })
        .catch((err) => {
          this.$awn.alert(
            err?.message ?? "Erreur impossible d'annuler l'imputation"
          );
        });
    },
    annulerImputer(travailId) {
      // const ids = travailId ? [travailId] : this.travaux.map((t) => t.id);
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette imputation ?',
          question:
            "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau ce travail.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('annulerImputationTravail', travailId)
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

      return dataItem?.statut == 2 ? 'table-success' : 'table-warning';
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
