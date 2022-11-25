<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title me-auto">Indemnités et Frais annuels</h3>
          <button
            class="btn btn-outline-primary me-2"
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
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :data="computedData"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucune écriture à afficher"
          detail-row-class="m-td-0 p-0"
          :detail-row-component="detailRow"
          :selectable="true"
          @selected="selected"
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
              title="Regénérer les frais de ce sapeur"
              class="btn btn-outline-primary border-0"
              @click="regenererSapeur(props.rowData.id)"
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
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';
import store from '@/store/index';
import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails.vue';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  let loadComptes = store.dispatch('fetchComptes');
  let loadFraisIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  Promise.all([loadComptes, loadFraisIndemnites]).then(() => {
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
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    let svm = this;
    return {
      detailRow: markRaw(FraisEcritureDetails),
      loading: true,
      selectedId: null,
      ecritureColumns: [
        {
          title: 'Designation',
          field: 'designation',
        },
        {
          title: 'Type',
          field: 'type',
          formatter: (t) => {
            const mapping = {
              0: 'Autre',
              1: 'Solde',
              2: 'Indemnité',
              3: 'Frais forfaitaire',
              4: 'Frais effectif',
              5: 'Charge AVS/AC',
            };
            return mapping[t] ?? 'Autre';
          },
        },
        {
          title: 'Compte',
          field: 'compte_id',
          formatter: (id) => svm.comptes.find((f) => f.id == id)?.designation,
        },
        {
          title: 'Tarif',
          field: 'tarif',
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
          slot: 'details',
          dataClass: 'details-width',
        },
        {
          title: 'Sapeur',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Fonction',
          key: 'fonction',
          sortKey: 'fonction',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'montant',
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
      comptes: (state) => state.compte.liste,
      ecritures: (state) => state.imputation.ecritures.annuels,
      fonctions: (state) => state.fonction.liste,
      exercicesComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      //Group by sapeur ID
      return (
        Object.entries(
          this.ecritures.reduce((reduced, ecriture) => {
            (reduced[ecriture.sapeur_id] =
              reduced[ecriture.sapeur_id] || []).push(ecriture);
            return reduced;
          }, {})
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
              fonction: sapeur?.fonction_id
                ? this.fonctions.find((f) => f.id == sapeur?.fonction_id).nom
                : '',
            };
          })
          // Add data relative to table
          .map((s) => ({
            ...s,
            getEcritures: () =>
              new Promise(
                function (resolve) {
                  resolve(this.ecritures);
                }.bind(s)
              ),
            columns: this.ecritureColumns,
          }))
      );
    },
  },
  watch: {
    currentExerciceComptableId() {
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
    if (this.exercicesComptable.length === 0) {
      //console.log('Warning')
    }

    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchEcrituresAnnuels').then(() => {
        this.loading = false;
        this.selectedId = null;
      });
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(id) {
      this.selectedId = id;
    },
    regenererSapeur() {
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
            this.$store.dispatch(
              'annulerImputationAnnuel',
              this.currentExerciceComptableId
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
