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
    <div class="col-12 col-md-8 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Filtres</h3>
        </div>
        <form class="card-body">
          <div class="row">
            <base-select
              class="col-md-6"
              display-key="nom_prenom"
              base-option="&lt;Sapeur&gt;"
              :options="filteredSapeurs"
              @update:model-value="(value) => onFilter('sapeur_id', value)"
            />
            <base-select
              class="col-md-6"
              base-option="&lt;Type&gt;"
              :options="[
                { id: 0, designation: 'Autre' },
                { id: 1, designation: 'Solde' },
                { id: 2, designation: 'Indemnité' },
                { id: 3, designation: 'Frais forfaitaire' },
                { id: 4, designation: 'Frais effectif' },
                { id: 5, designation: 'Charges AVS/AC' },
              ]"
              @update:model-value="(value) => onFilter('type', value)"
            />
          </div>
        </form>
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
          :data="filteredData"
          @selected="selected"
        >
          <template #foot>
            <tr>
              <th colspan="4">Total</th>
              <th>
                {{
                  filteredData
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
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

import CompteService from '/src/services/CompteService.js';

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
      filters: {},
      selectedId: null,
      fields: [
        { title: 'Date', key: 'date', type: Date },
        {
          title: 'Type',
          key: 'type',
          formatter: (type) => {
            const mapping = {
              0: 'Autre',
              1: 'Solde',
              2: 'Indemnité',
              3: 'Frais forfaitaire',
              4: 'Frais effectif',
              5: 'Charges AVS/AC',
            };
            return mapping[type] || '';
          },
        },
        { title: 'Designation', key: 'designation' },
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Total', key: 'total' },
        { title: 'Actions', slot: 'actions' },
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
    filteredData() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0)
          .map(
            ([key, value]) =>
              (x) =>
                x[key] === value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
    filteredSapeurs() {
      const ids = new Set(this.ecritures.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
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
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
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

      this.SHOW_MODAL({ component: 'ModalChargement' });

      CompteService.downloadJustificatifIndividuel(
        filename,
        this.activeExerciceComptableId,
        compteId
      )
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((err) => {
          this.HIDE_MODAL();
          this.$awn.alert(
            err?.message ||
              'Une erreur a eu lieu durant la génération de votre fichier'
          );
        });
    },
    justificatifComplet() {
      const filename = `${this.formatedDate()}_justificatif-complet.pdf`;

      this.SHOW_MODAL({ component: 'ModalChargement' });

      CompteService.downloadJustificatifComplet(
        filename,
        this.activeExerciceComptableId
      )
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((err) => {
          this.HIDE_MODAL();
          this.$awn.alert(
            err?.message ||
              'Une erreur a eu lieu durant la génération de votre fichier'
          );
        });
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
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
