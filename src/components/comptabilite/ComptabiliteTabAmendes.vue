<template>
  <div class="row">
    <div class="col-md-12">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Amendes</h3>
          <button class="btn btn-primary" @click="generer">
            Générer les amendes
          </button>
        </div>
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data="Aucune amende à afficher"
          :detail-row-component="detailRow"
          :data="filteredAmendes"
          :selectable="true"
          select-key="id"
          row-selected-class="table-primary"
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
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { markRaw } from 'vue';
import AmendesSapeurDetails from '@/components/amende/AmendeSapeurDetails.vue';

import BaseTable from '@/components/table/BaseTable.vue';

import store from '@/store/index';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadAmendes = store.dispatch('fetchAmendesExerciceComptable');
  Promise.all([loadSapeurs, loadAmendes]).then(() => {
    next();
  });
}

export default {
  name: 'ComptabiliteTabAmendes',
  components: {
    BaseTable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      detailRow: markRaw(AmendesSapeurDetails),
      loading: true,
      filters: {},
      amendeColumns: [
        {
          title: 'Exercice',
          field: 'designation',
        },
        {
          title: 'Excuse',
          field: 'complement',
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
          key: 'details',
          slot: 'details',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Nombre',
          key: 'nb',
          sortKey: 'nb',
        },
        {
          title: 'Montant',
          key: 'total',
          sortKey: 'total',
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
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      amendes: (state) => state.imputation.ecritures.amendes,
    }),
    ...mapGetters(['currentExerciceComptableId']),
    filteredAmendes() {
      const amendes = this.amendes.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val)
          .map(
            ([key, value]) =>
              (x) =>
                x[key] == value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );

      const sapeurs = amendes.reduce((rv, a) => {
        (rv[a.sapeur_id] = rv[a.sapeur_id] || {
          ...this.sapeurs.find((s) => s.id == a.sapeur_id),
          amendes: [],
        }).amendes.push(a);
        return rv;
      }, {});
      return Object.values(sapeurs).map((s) => ({
        ...s,
        nb: s.amendes.length,
        sapeur: s.nom + ' ' + s.prenom,
        total: s.amendes.reduce((rv, a) => rv + parseFloat(a.total), 0.0),
        columns: this.amendeColumns,
      }));
    },
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchAmendesExerciceComptable').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    selected(id) {
      this.selectedId = id;
    },
    generer() {
      this.$store.dispatch(
        'genererAmendesAnnuels',
        this.currentExerciceComptableId
      );
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }
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
