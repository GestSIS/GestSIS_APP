<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
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
          <button class="btn btn-outline-primary" :disabled="!selected || true">
            Résumé des frais
          </button>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Sapeurs</h3>
          <!--          <button @click.prevent="save" class="btn btn-primary">-->
          <!--            Enregistrer-->
          <!--          </button>-->
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
          :detail-row-component="detailRow"
          detail-row-class="m-td-0"
          no-data="Aucun sapeur à afficher"
          :data="computedData"
          @selected="select"
        >
          <template #details="props">
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
          </template>
          <template #actions="props">
            <button
              class="btn btn-outline-primary border-0"
              title="Décompte sapeur"
              :disabled="!props.rowData.aPayer"
              @click="
                genererDecompteSapeur(props.rowData.id, props.rowData.nomPrenom)
              "
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </template>
          <template #foot>
            <tr>
              <th></th>
              <th colspan="2">Total</th>
              <th>
                {{
                  computedData
                    .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                    ?.toFixed(2)
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
</template>

<script>
import store from '@/store/index';
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';

import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails.vue';
import ImputationService from '@/services/ImputationService.js';

async function loadData(_, next) {
  const loadExercicesComptable = store.dispatch('fetchExercicesComptables');
  const loadSapeur = store.dispatch('fetchListeSapeur');
  const loadFonction = store.dispatch('fetchFonctions');

  Promise.all([loadExercicesComptable, loadSapeur, loadFonction]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabSapeur',
  components: { BaseTable },
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
      detailRow: markRaw(FraisEcritureDetails),
      loading: true,
      ecritures: [],
      selected: null,
      ecritureColumns: [
        {
          title: 'Date',
          field: 'date',
          type: 'date',
        },
        {
          title: 'Ecriture',
          field: 'designation',
        },
        {
          title: 'Tarif',
          field: 'tarif',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Tarif min',
          field: 'indemnite',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Quantité',
          field: 'quantite',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Taux',
          field: 'taux',
          headerClassName: 'text-center',
          className: 'text-end',
        },
        {
          title: 'Total',
          field: 'total',
          headerClassName: 'text-center',
          className: 'text-end',
        },
      ],
      fields: [
        {
          title: '',
          key: 'details',
          dataClass: 'details-width',
          slot: 'details',
        },
        {
          title: 'Sapeur',
          key: 'nomPrenom',
          sortField: 'nomPrenom',
        },
        {
          title: 'Fonction',
          key: 'fonction',
          sortField: 'fonction',
        },
        {
          title: 'Total',
          key: 'total',
          sortField: 'total',
          formatter: (t) => parseFloat(t).toFixed(2),
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
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      exercicesComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
    computedData() {
      // Details of ecritures for an intervention will be loaded on the flight
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
            nomPrenom: `${s.nom} ${s.prenom}`,
            fonction: s.fonction_id
              ? this.fonctions.find((f) => f.id == s.fonction_id).nom
              : '',
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
            getEcritures: () => Promise.resolve(ecrituresBySapeur.get(s.id)),
            columns: this.ecritureColumns,
          };
        });
    },
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      ImputationService.getEcrituresForExerciceComptable(
        this.currentExerciceComptableId
      ).then((data) => {
        this.ecritures = data;
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = true;
    ImputationService.getEcrituresForExerciceComptable(
      this.currentExerciceComptableId
    ).then((data) => {
      this.ecritures = data;
      this.loading = false;
    });
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    genererDecompteSapeur(sapeurId, sapeur) {
      this.SHOW_MODAL({
        component: 'modalDecompte',
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
