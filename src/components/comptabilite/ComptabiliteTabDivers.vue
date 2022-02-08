<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button class="btn btn-outline-primary" @click="generer">Nouveau</button>
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedItem"
            @click="modifier(selectedItem)"
          >Modifier</button>
          <button
            class="btn btn-outline-danger"
            :disabled="!selectedItem"
            @click="supprimer(selectedItem)"
          >Supprimer</button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Autres</h3>
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucune écriture à afficher"
          :data="[]"
          @selected="selected"
          :selectable="true"
          selectKey="id"
          row-selected-class="table-primary"
        ></base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
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
  name: 'comptabiliteDivers',
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
      this.$store.dispatch('fetchAmendesExerciceComptable').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      filters: {},
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
          columnClass: 'align-middle text-center'
        },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    ...mapGetters(['currentExerciceComptableId']),
  },
  methods: {
    selected(item) {
      this.selectedItem = item;
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
