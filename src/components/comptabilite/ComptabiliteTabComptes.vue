<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            class="btn btn-outline-primary"
            @click="justificatifIndividuel(activeCompteId)"
          >
            Justificatif du compte
          </button>
          <button class="btn btn-outline-primary" @click="justificatifComplet">
            Justificatif complet
          </button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <div class="card-title">
            <h3 class="card-title">Comptes</h3>
            <base-dropdown
              buttonClass="ms-1 btn btn-outline-secondary dropdown-toggle"
              menuClass="dropdown-menu"
              ref="dropdown"
              :title="formatCompte(comptes.find((f) => f.id == activeCompteId))"
            >
              <template #default>
                <button
                  v-for="c in comptes"
                  :key="c.id"
                  @click="selectCompte(c.id)"
                  class="dropdown-item"
                  :class="{ active: activeCompteId == c.id }"
                  type="button"
                >
                  {{ formatCompte(c) }}
                </button>
              </template>
            </base-dropdown>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          no-data="Aucune écriture à afficher"
          @selected="selected"
          :selectable="true"
          selectKey="id"
          row-selected-class="table-primary"
          :data="computedData"
        >
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import store from '@/store/index';

import CompteService from '@/services/CompteService.js';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(routeTo, next) {
  const loadExercices = store.dispatch('fetchExercicesComptables');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadComptes = store.dispatch('fetchComptes');

  Promise.all([loadExercices, loadComptes, loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabCompte',
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
      dropdown: false,
      loading: true,
      selectedId: null,
      fields: [
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'total',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      ecritures: (state) => state.imputation.active.ecritures,
      activeCompteId: (state) => state.imputation.active.compteId,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
    }),
    computedData() {
      let svm = this;
      return this.ecritures.map((e) => ({
        ...e,
        sapeur: [svm.sapeurs.find((s) => s.id == e.sapeur_id)].map((s) =>
          s ? `${s.nom} ${s.prenom}` : ''
        )[0],
      }));
    },
  },
  mounted() {
    this.loading = true;
    this.init();
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.init();
    },
    comptes(newOne, oldOne) {
      if (oldOne.length === 0) {
        this.init();
      }
    },
  },
  methods: {
    formatCompte(compte) {
      if (!compte) return '';
      return compte?.numero + ' - ' + compte?.designation;
    },
    selected(id) {
      this.selectedId = id;
    },
    formatedDate() {
      var today = new Date();
      return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
    },
    justificatifIndividuel(compteId) {
      const compte = this.comptes.find((f) => f.id == this.activeCompteId);
      const filename = `${this.formatedDate()}_justificatif-compte-${
        compte.numero
      }.pdf`;

      CompteService.downloadJustificatifIndividuel(
        filename,
        this.activeExerciceComptableId,
        compteId
      );
    },
    justificatifComplet() {
      const filename = `${this.formatedDate()}_justificatif-complet.pdf`;

      CompteService.downloadJustificatifComplet(
        filename,
        this.activeExerciceComptableId
      );
    },
    selectCompte(id) {
      this.$refs.dropdown.close();
      this.selectedId = null;
      this.$store.dispatch('selectActiveCompte', id).then(() => {});
      this.dropdown = false;
    },
    init() {
      this.$store.dispatch('fetchEcritureComptes').then(() => {
        this.loading = false;
        this.selectedId = null;
      });
    },
    ...mapMutations(['SHOW_MODAL']),
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
