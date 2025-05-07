<template>
  <stateful-filter
    id="annuel"
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
              class="btn btn-outline-primary"
              :title="computedData.length ? 'Regénérer tous' : 'Générer'"
              @click.prevent="generer"
            >
              {{ computedData.length ? 'Regénérer' : 'Générer' }}
            </button>
            <button
              v-if="computedData.length"
              class="btn btn-outline-danger"
              @click.prevent="annulerImputation"
            >
              Tout supprimer
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Filtres</h3>
          </div>
          <form class="card-body">
            <base-select
              display-key="nom_prenom"
              base-option="&lt;Sapeur&gt;"
              :options="filteredSapeurs"
              :model-value="filters.id"
              @update:model-value="(value) => setFilter('id', value)"
            />
            <div v-if="canReset" class="w-100 mt-3">
              <button class="btn btn-sm btn-warning w-100" @click="reset">
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title me-auto">Indemnités et Frais annuels</h3>
          </div>
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              v-show="!loading"
              :data="filteredData"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :detail-row-column="true"
              :detail-row-component="detailRowComponent"
              :detail-row-options="detailRowOptions"
              detail-row-class="m-td-0 p-0"
              :selectable="true"
              @selected="selected"
            >
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission"
                  title="Regénérer les frais de ce sapeur"
                  class="btn btn-outline-primary border-0"
                  @click="regenererSapeur(rowData)"
                >
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
                </button>
              </template>
              <template #foot>
                <tr>
                  <th :colspan="filteredData.length ? 3 : 2">Total</th>
                  <th>
                    {{
                      filteredData
                        .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                        ?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                    }}
                    CHF
                  </th>
                  <th></th>
                </tr>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import { markRaw } from 'vue';
import store from '/src/store/index';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import permissions from '../../store/permissions';

async function loadData(routeTo, next) {
  const loadComptes = store.dispatch('fetchComptes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadFraisIndemnites = store.dispatch('fetchFraisIndemnitesTypes');

  Promise.all([loadComptes, loadFraisIndemnites, loadFonctions]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabAnnuel',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    const svm = this;
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      loading: true,
      selectedId: null,
      detailRowOptions: {
        fields: [
          { title: 'Designation', key: 'designation' },
          {
            title: 'Type',
            key: 'type',
            formatter: (t) => {
              const mapping = {
                0: 'Autre',
                1: 'Solde',
                2: 'Indemnité',
                3: 'Frais forfaitaire',
                4: 'Frais effectif',
                5: 'Cotisation AVS/AC',
              };
              return mapping[t] ?? 'Autre';
            },
          },
          {
            title: 'Compte',
            key: 'compte_id',
            formatter: (id) => svm.comptes.find((f) => f.id == id)?.label,
          },
          {
            title: 'Tarif',
            key: 'tarif',
            type: Number,
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Quantité',
            key: 'quantite',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Total',
            key: 'total',
            type: Number,
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
        ],
      },
      fields: [
        { title: 'Sapeur', key: 'nom_prenom' },
        { title: 'Fonction', key: 'fonction' },
        { title: 'Total', key: 'total', type: Number },
        {
          title: 'Actions',
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
      comptes: (state) => state.compte.liste,
      ecritures: (state) => state.imputation.ecritures.annuels,
      fonctions: (state) => state.fonction.liste,
      exercicesComptable: (state) => state.exerciceComptable.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.COMPTABILITE.MODIFICATION,
        ),
    }),
    computedData() {
      //Group by sapeur ID
      return (
        Object.entries(
          this.ecritures.reduce((reduced, ecriture) => {
            (reduced[ecriture.sapeur_id] =
              reduced[ecriture.sapeur_id] || []).push(ecriture);
            return reduced;
          }, {}),
        )
          // Map to real data
          .map(([key, value]) => ({
            id: +key,
            ecritures: value,
            total: value
              .map((e) => parseFloat(e.total))
              .reduce((a, b) => a + b),
          }))
          // Add sapeur data
          .map((e) => {
            let sapeur = this.sapeurs.find((s) => s.id == e.id);
            return {
              ...e,
              ...sapeur,
              fonction: this.fonctions.find((f) => f.id == sapeur?.fonction_id)
                ?.nom,
            };
          })
          // Add data relative to table
          .map((s) => ({
            ...s,
            getData: () =>
              new Promise(
                function (resolve) {
                  resolve(this.ecritures);
                }.bind(s),
              ),
          }))
      );
    },
    filteredSapeurs() {
      const ids = new Set(this.ecritures.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchEcrituresAnnuels').then(() => {
        this.selectedId = null;
        this.loading = false;
      });
    },
  },
  mounted() {
    this.$store.dispatch('fetchListeSapeur');
    if (this.fonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }

    if (this.activeExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchEcrituresAnnuels').then(() => {
        this.loading = false;
        this.selectedId = null;
      });
    }
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    selected(id) {
      this.selectedId = id;
    },
    regenererSapeur() {
      // TODO: Fix this feature
      this.SHOW_MODAL({ component: 'ModalImputerAnnuel', size: 2 });
    },
    async annulerImputation() {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: "Voulez-vous annuler l'imputation annuel des frais ?",
          question:
            'Attention, les écritures actuelles seront supprimées, mais il vous sera toujours possible de générer ces écritures à nouveau.',
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch(
                'annulerImputationAnnuel',
                this.activeExerciceComptableId,
              )
              .catch((err) =>
                this.$awn.alert(
                  err?.message ??
                    "Une erreur est survenue durant l'annulation des indemnités/frais annuelles",
                ),
              );
          }
        },
      });
    },
    generer() {
      this.SHOW_MODAL({ component: 'ModalImputerAnnuel', size: 2 });
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }
      const statutsClass = {
        0: 'text-danger', //'inactif',
        1: '', //'Actif',
      };
      return statutsClass[dataItem.actif];
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
