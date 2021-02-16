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
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_annuels"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data-template="Aucun écriture à afficher"
          :detail-row-component="detailRow"
        >
          <div slot="details" slot-scope="props" class="d-flex">
            <button
              class="btn btn-link border-0"
              @click="toggleDetails(props.rowData.id)"
            >
              <font-awesome-icon
                v-if="toggles[props.rowData.id] || false"
                :icon="['fas', 'angle-down']"
              />
              <font-awesome-icon
                v-if="!(toggles[props.rowData.id] || false)"
                :icon="['fas', 'angle-right']"
              />
            </button>
          </div>
          <div slot="actions" slot-scope="props" class="d-flex">
            <button
              class="btn btn-outline-primary border-0"
              @click="regenererSapeur(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div>
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '@/store/index';
import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

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
    Vuetable,
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
        this.loading = false;
        this.$refs.vuetable_frais_annuels.setData(this.computeData());
      });
    },
    listeEcritures() {
      this.loading = true;
      this.$refs.vuetable_frais_annuels.setData(this.computeData());
      this.loading = false;
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
        this.$refs.vuetable_frais_annuels.setData(this.computeData());
      });
    }
  },
  data() {
    let svm = this;
    return {
      css: CssForBootstrap4,
      toggles: {},
      detailRow: FraisEcritureDetails,
      loading: true,
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
          name: 'details',
          dataClass: 'details-width',
        },
        {
          title: 'Sapeur',
          name: 'nomPrenom',
          sortField: 'nomPrenom',
        },
        {
          title: 'Fonction',
          name: 'fonction',
          sortField: 'fonction',
        },
        {
          title: 'Total',
          name: 'total',
          sortField: 'montant',
        },
        {
          title: 'Actions',
          name: 'actions',
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
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    computeData() {
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
              nomPrenom: sapeur.nom + ' ' + sapeur.prenom,
              fonction: sapeur.fonction_id
                ? this.getFonction(sapeur.fonction_id).nom
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
    regenererSapeur() {
      this.SHOW_MODAL({ component: 'ModalImputerAnnuel', size: 2 });
    },
    generer() {
      this.SHOW_MODAL({ component: 'ModalImputerAnnuel', size: 2 });
    },
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id],
      };
      this.$refs.vuetable_frais_annuels.toggleDetailRow(id);
    },
    dataManager(sortOrder) {
      let local = this.computeData();
      if (local.length < 1) return;

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        local = _.orderBy(
          local,
          sortOrder[0].sortField,
          sortOrder[0].direction
        );
      }

      return {
        data: local,
      };
    },
    onRowClass(dataItem) {
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
