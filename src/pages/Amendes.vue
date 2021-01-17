<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/"> Accueil </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Amendes</li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des amendes</h3>
            <button
              class="btn btn-primary"
              @click="generer"
            >
              Générer les amendes
            </button>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <vuetable
            v-show="!loading"
            ref="vuetable_amendes_sapeurs"
            :api-mode="false"
            :fields="fields"
            :css="css.table"
            :data-manager="dataManager"
            :row-class="onRowClass"
            detail-row-class="m-td-0"
            no-data-template="Aucun amende à afficher"
            :detail-row-component="detailRow"
          >
            <div slot="details" slot-scope="props">
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
            <!-- <div slot="actions" slot-scope="props">
              <button
                class="btn btn-outline-primary border-0"
                v-if="props.rowData.statut === 2"
                @click="imputerIntervention(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
            </div> -->
          </vuetable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import AmendesSapeurDetails from '@/components/amende/AmendesSapeurDetails';
import ComptabiliteService from '@/services/ComptabiliteService';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

import store from '@/store/index';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadAmendes = store.dispatch('fetchAmendes');
  Promise.all([loadSapeurs, loadAmendes]).then(() => {
    next();
  });
}

export default {
  name: 'amendes',
  components: {
    Vuetable,
    ExerciceComptable,
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
      this.$store.dispatch('fetchAmendes').then(() => {
        this.loading = false;
        this.$refs.vuetable_amendes_sapeurs.setData(this.filteredAmendes);
      });
    },
    filteredAmendes(data) {
      this.loading = false;
      console.log("Test")
      this.$refs.vuetable_amendes_sapeurs.setData(data);
    },
  },
  mounted() {
    this.loading = false;
    this.$refs.vuetable_amendes_sapeurs.setData(this.filteredAmendes);
  },
  data() {
    const self = this;
    return {
      css: CssForBootstrap4,
      toggles: [],
      detailRow: AmendesSapeurDetails,
      amendeColumns: [
        {
          title: 'Exercice',
          field: 'designation'
        },
        {
          title: 'Date',
          field: 'date',
        },
        {
          title: 'Total',
          field: 'total',
        },
      ],
      fields: [
        {
          title: '',
          name: 'details',
        },
        {
          title: 'Sapeur',
          name: 'sapeur',
          sortField: 'sapeur',
        },
        {
          title: 'Nombre',
          name: 'nb',
          sortField: 'nb',
        },
        {
          title: "Montant",
          name: 'total',
          sortField: 'total',
        },
        {
          title: 'Actions',
          name: 'actions',
        },
      ],
      loading: true,
      filters: {},
    };
  },
  computed: {
    ...mapState({
      listeLocalites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      listeAmendes: (state) => state.comptabilite.amendes
    }),
    ...mapGetters(['currentExerciceComptableId', 'getSapeur']),
    filteredAmendes() {
      const amendes = this.listeAmendes.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val)
          .map(([key, value]) => (x) => x[key] === value)
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );

      const sapeurs = amendes.reduce((rv, a) => {
        (rv[a.sapeur_id] = rv[a.sapeur_id] || {
          ...this.getSapeur(a.sapeur_id),
          amendes: [],
        }).amendes.push(a);
        return rv;
      }, {});
      return Object.values(sapeurs).map(s => ({
          ...s,
          nb: s.amendes.length,
          sapeur: s.nom+" "+s.prenom,
          total: s.amendes.reduce((rv, a) => rv + parseFloat(a.total), 0.0),
          columns: this.amendeColumns,
      }));
    },
  },
  methods: {
    generer() {
      this.$store.dispatch('genererAmendesAnnuels', this.currentExerciceComptableId);
    },
    toggleDetails(id) {
      this.toggles[id] = !this.toggles[id];
      this.$refs.vuetable_amendes_sapeurs.toggleDetailRow(id);
    },
    dataManager(sortOrder) {
      if (this.filteredAmendes.length < 1) return;

      let local = this.filteredAmendes;

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
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem) {
      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'En attente de validation',
        2: '', // 'Validée',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style lang="scss" scoped></style>
