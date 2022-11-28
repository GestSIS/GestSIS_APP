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
              ref="dropdown"
              button-class="ms-1 btn btn-outline-secondary dropdown-toggle"
              menu-class="dropdown-menu"
              :title="formatCompte(comptes.find((f) => f.id == activeCompteId))"
            >
              <template #default>
                <button
                  v-for="c in comptes"
                  :key="c.id"
                  class="dropdown-item"
                  :class="{ active: activeCompteId == c.id }"
                  type="button"
                  @click="selectCompte(c.id)"
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
          :selectable="true"
          :data="computedData"
          @selected="selected"
        >
          <template #foot>
            <tr>
              <th colspan="3">Total</th>
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
import { mapState } from 'vuex';
import store from '@/store/index';

import CompteService from '@/services/CompteService.js';

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
          title: 'Date',
          key: 'date',
          type: Date,
        },
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
        sapeur: svm.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
      }));
    },
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
  mounted() {
    this.loading = true;
    this.init();
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
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
