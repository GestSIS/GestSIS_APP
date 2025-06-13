<template>
  <stateful-filter
    id="travaux"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div v-if="hasEditPermission" class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              v-if="!selectedItem || selectedItem?.statut == 1"
              class="btn btn-outline-primary"
              :disabled="selectedItem?.statut != 1"
              @click="imputer(selectedId)"
            >
              Imputer le travail
            </button>
            <button
              v-if="selectedItem?.statut == 2"
              class="btn btn-outline-danger"
              @click="annulerImputer(selectedId)"
            >
              Annuler l'imputation du travail
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
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="mb-1 col-md-4"
                :options="filteredTravailTypes"
                base-option="<Type>"
                :model-value="filters.travail_type_id"
                @update:model-value="
                  (value) => setFilter('travail_type_id', value)
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
                :model-value="filters.statut"
                @update:model-value="(value) => setFilter('statut', value)"
              />
              <div v-if="canReset" class="col-md-4">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Fiches de travails</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucun travail à afficher"
              :detail-row-column="true"
              :detail-row-column-hide-button="(r) => r.statut !== 2"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row
                  :options="detailRowOptions"
                  :rowData="rowData"
                />
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission && rowData.statut == 2"
                  class="btn btn-outline-primary border-0"
                  title="Annuler imputation"
                  @click="annulerImputer(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasEditPermission && rowData.statut == 1"
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
    </div>
  </stateful-filter>
</template>

<script>
import store from '/src/store/index';
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import permissions from '../../store/permissions';

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
  components: { GenericDetailsRow },
  data() {
    return {
      loading: true,
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
              ecriture.module == 5 ? -total : total,
            type: Number,
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
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.COMPTABILITE.MODIFICATION,
        ),
    }),
    computedData() {
      return this.travaux.map((e) => ({
        ...e,
        travail_type: this.travailTypes.find((t) => t.id == e.travail_type_id)
          ?.designation,
        sapeur: this.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        auteur: this.sapeurs.find((s) => s.id == e.auteur_id)?.nom_prenom,
        unite: this.unites.find(
          (u) =>
            u.id ==
            this.travailTypes.find((t) => t.id == e.travail_type_id)
              ?.type_unite_id,
        )?.unite,
        getData: () => Promise.resolve(e.ecritures),
      }));
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
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
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
            err?.message ?? "Erreur impossible d'annuler l'imputation",
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
                  err?.message ?? "Erreur impossible d'annuler l'imputation",
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
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
