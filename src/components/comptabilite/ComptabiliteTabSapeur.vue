<template>
  <stateful-filter
    id="sapeurs"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div v-if="hasEditPermission" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button class="btn btn-outline-primary" disabled>
              Créer un décompte individuel
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Impressions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              class="btn btn-outline-primary"
              :disabled="!selected || true"
            >
              Résumé des frais
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
            <div v-if="canReset" class="w-100 mt-2">
              <button class="btn btn-sm btn-warning w-100" @click="reset">
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline table-responsive mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Sapeurs</h3>
          </div>
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :selectable="true"
            :fields="fields"
            :detail-row-column="true"
            :detail-row-component="detailRowComponent"
            :detail-row-options="detailRowOptions"
            detail-row-class="m-td-0"
            no-data="Aucun sapeur à afficher"
            :data="filteredData"
            @selected="select"
          >
            <template #actions="{ rowData }">
              <button
                v-if="hasEditPermission"
                class="btn btn-outline-primary border-0"
                title="Décompte sapeur"
                :disabled="!rowData.aPayer"
                @click="genererDecompteSapeur(rowData.id, rowData.nom_prenom)"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
            </template>
            <template #foot>
              <tr>
                <th></th>
                <th :colspan="filteredData.length ? 2 : 1">Total</th>
                <th>
                  {{
                    filteredData
                      .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                      ?.toLocaleString(undefined, { minimumFractionDigits: 2 })
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
  </stateful-filter>
</template>

<script>
import store from '/src/store/index';
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import ImputationService from '/src/services/ImputationService.js';
import permissions from '../../store/permissions';

async function loadData(_, next) {
  const loadExercicesComptable = store.dispatch('fetchExercicesComptables');
  const loadSapeur = store.dispatch('fetchListeSapeur');
  const loadFonction = store.dispatch('fetchFonctions');
  const loadCompte = store.dispatch('fetchComptes');

  Promise.all([
    loadExercicesComptable,
    loadSapeur,
    loadFonction,
    loadCompte,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabSapeur',
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
      ecritures: [],
      selected: null,
      detailRowOptions: {
        fields: [
          { title: 'Date', key: 'date', type: Date },
          { title: 'Ecriture', key: 'designation' },
          {
            title: 'Module',
            key: 'module',
            formatter: (t) => {
              const mapping = {
                1: 'Exercice & séance',
                2: 'Intervention',
                3: 'Frais et indemnité annuel',
                0: 'Ecriture divers',
                5: 'Amende',
                6: 'Fiche de travail',
                7: 'Cours',
                4: 'Avs',
              };
              return mapping[t] ?? 'Autre';
            },
          },
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
            title: 'Tarif',
            key: 'tarif',
            type: Number,
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Tarif min',
            key: 'indemnite',
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
            title: 'Taux',
            key: 'taux',
            type: Number,
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
        { title: 'Sapeur', key: 'nom_prenom', sortField: 'nom_prenom' },
        { title: 'Fonction', key: 'fonction', sortField: 'fonction' },
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
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      exercicesComptable: (state) => state.exerciceComptable.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeInterventionId: (state) => state.intervention.active.id,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.COMPTABILITE.MODIFICATION
        ),
    }),
    computedData() {
      let ecrituresBySapeur = this.ecritures
        .filter((s) => s.sapeur_id)
        .reduce((acc, e) => {
          acc.set(e.sapeur_id, [...(acc.get(e.sapeur_id) || []), e]);
          return acc;
        }, new Map());

      return this.sapeurs
        .filter((s) => ecrituresBySapeur.has(s.id))
        .map((s) => {
          return {
            id: s.id,
            nom_prenom: s.nom_prenom,
            fonction:
              this.fonctions.find((f) => f.id == s.fonction_id)?.nom ?? '',
            aPayer:
              ecrituresBySapeur
                .get(s.id)
                .findIndex(
                  (e) =>
                    e.decompte_id == null &&
                    !this.comptes.find((c) => c.id === e.compte_id)?.produit
                ) >= 0,
            total: ecrituresBySapeur
              .get(s.id)
              .reduce(
                (a, b) =>
                  a +
                  (this.comptes.find((c) => c.id === b.compte_id)?.produit
                    ? -b.total
                    : +b.total),
                0
              ),
            getData: () =>
              Promise.resolve(
                ecrituresBySapeur
                  .get(s.id)
                  .map((e) =>
                    this.comptes.find((c) => c.id === e.compte_id)?.produit
                      ? { ...e, total: -e.total, tarif: -e.tarif }
                      : e
                  )
              ),
          };
        });
    },
    filteredSapeurs() {
      const ids = new Set(this.ecritures.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      ImputationService.getEcrituresForExerciceComptable(
        this.activeExerciceComptableId
      ).then((data) => {
        this.ecritures = data;
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = true;
    ImputationService.getEcrituresForExerciceComptable(
      this.activeExerciceComptableId
    ).then((data) => {
      this.ecritures = data;
      this.loading = false;
    });
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    genererDecompteSapeur(sapeurId, sapeur) {
      this.SHOW_MODAL({
        component: 'ModalDecompte',
        data: {
          type: 'sapeur',
          sapeurId,
          designation: sapeur,
        },
      });
    },
    select(id) {
      this.selected = id;
    },
  },
};
</script>

<style scoped></style>
