<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Indemnités et Frais annuels</h3>
          <button @click.prevent="generer" class="btn btn-primary">
            Générer
          </button>
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :data="computedData"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucune écriture à afficher"
          detail-row-class="m-td-0"
          :detail-row-component="detailRow"
          @selected="selected"
          :selectable="true"
          selectKey="id"
          row-selected-class="table-primary"
        >
          <div slot="details" slot-scope="props" class="d-flex">
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
          </div>
          <div slot="actions" slot-scope="props" class="d-flex">
            <button
              title="Regénérer les frais de ce sapeur"
              class="btn btn-outline-primary border-0"
              @click="regenererSapeur(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '@/store/index';
import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  let loadComptes = store.dispatch('fetchComptes');
  let loadFrais = store.dispatch('fetchFraisTypes');
  let loadIndemnites = store.dispatch('fetchIndemnitesTypes');
  Promise.all([loadComptes, loadFrais, loadIndemnites]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabAnnuel',
  components: {
    BaseTable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
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
    if (this.listeFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
    if (this.listeExerciceComptable.length === 0) {
      //console.log('Warning')
    }

    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchEcrituresAnnuels').then(() => {
        this.loading = false;
        this.selectedId = null;
      });
    }
  },
  data() {
    let svm = this;
    return {
      detailRow: FraisEcritureDetails,
      loading: true,
      selectedId: null,
      ecritureColumns: [
        {
          title: 'Designation',
          field: 'designation',
        },
        {
          title: 'Type',
          field: 'frais',
          formatter: (field) => (field > 0 ? 'Frais' : 'Indemnité'),
        },
        {
          title: 'Compte',
          field: 'compte_id',
          formatter: (field) => svm.getCompte(field).designation,
        },
        {
          title: 'Tarif',
          field: 'tarif',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Quantité',
          field: 'quantite',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Total',
          field: 'total',
          headerClassName: 'text-center',
          className: 'text-right',
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
          key: 'nomPrenom',
          sortKey: 'nomPrenom',
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
        },
      ],
    };
  },
  props: {
    id: {
      type: String,
    },
  },
  computed: {
    ...mapState({
      listeEcritures: (state) => state.imputation.ecritures.annuels,
      listeFonctions: (state) => state.fonction.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['getLocalite', 'getSapeur', 'getFonction', 'getCompte']),
    computedData() {
      //Group by sapeur ID
      return (
        Object.entries(
          this.listeEcritures.reduce((reduced, ecriture) => {
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
            let sapeur = this.getSapeur(e.id);
            return {
              ...e,
              ...sapeur,
              nomPrenom: sapeur?.nom + ' ' + sapeur?.prenom,
              fonction: sapeur?.fonction_id
                ? this.getFonction(sapeur?.fonction_id).nom
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
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(id) {
      this.selectedId = id;
    },
    regenererSapeur() {
      this.SHOW_MODAL({ component: 'ModalImputerAnnuel', size: 2 });
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
