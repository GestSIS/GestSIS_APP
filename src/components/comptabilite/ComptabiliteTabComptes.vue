<template>
  <div class="row">
    <div class="col-sm-12 col-xl-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-outline-primary btn-block">
            Justificatif pour un compte
          </button>
          <button class="btn btn-outline-primary btn-block">
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
            <div class="dropdown">
              <button
                class="ml-1 btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                @click="dropdown = !dropdown"
                v-if="activeCompteId !== null"
              >
                {{ getCompte(activeCompteId) | compte }}
              </button>
              <div class="dropdown-menu" :class="{ show: dropdown }">
                <button
                  v-for="c in listeCompte"
                  :key="c.id"
                  @click="selectCompte(c.id)"
                  class="dropdown-item"
                  :class="{ active: activeCompteId === c.id }"
                  type="button"
                >
                  {{ c | compte }}
                </button>
              </div>
            </div>
          </div>
          <!--          <button type="button" class="btn btn-primary" @click="manageComptes">-->
          <!--            Gestion des comptes-->
          <!--          </button>-->
        </div>
        <!--        <div class="card-body">-->
        <!--          <table id="sap-promotions" class="table table-sm" cellspacing="0" width="100%">-->
        <!--            <thead>-->
        <!--              <tr>-->
        <!--                <th>Nom Prénom</th>-->
        <!--                <th>Date</th>-->
        <!--                <th>Heure</th>-->
        <!--                <th>Designation</th>-->
        <!--                <th>Type de frais</th>-->
        <!--                <th class="text-center">Actions</th>-->
        <!--              </tr>-->
        <!--            </thead>-->
        <!--            <tbody></tbody>-->
        <!--          </table>-->
        <!--        </div>-->
        <vuetable
          v-show="!loading"
          ref="vuetable_ecriture_comptes"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          no-data-template="Aucune écriture à afficher"
          :data-manager="dataManager"
        >
          <!--          <div slot="actions" slot-scope="props" class="d-flex">-->
          <!--              <button-->
          <!--                class="btn btn-outline-primary border-0"-->
          <!--                v-if="props.rowData.statut === 3"-->
          <!--                @click="imputerExercice(props.rowData.id)"-->
          <!--              >-->
          <!--                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />-->
          <!--              </button>-->
          <!--          </div>-->
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import store from '@/store/index';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

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
    Vuetable,
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
      css: CssForBootstrap4,
      fields: [
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
        },
        {
          title: 'Sapeur',
          name: 'sapeur',
          sortField: 'sapeur',
        },
        {
          title: 'Total',
          name: 'total',
          sortField: 'total',
        },
        {
          title: 'Actions',
          name: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      ecritures: (state) => state.imputation.active.ecritures,
      activeCompteId: (state) => state.imputation.active.compteId,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      listeSapeur: (state) => state.sapeur.liste,
      listeCompte: (state) => state.compte.liste,
    }),
    ...mapGetters(['getSapeur', 'getFonction', 'getCompte']),
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
    listeCompte(newOne, oldOne) {
      if (oldOne.length === 0) {
        this.init();
      }
    },
  },
  methods: {
    manageCompte() {
      //TODO: Manage comptes
    },
    selectCompte(id) {
      this.loading = true;
      this.$store.dispatch('selectActiveCompte', id).then(this.updateTable);
      this.dropdown = false;
    },
    init() {
      this.$store.dispatch('fetchEcritureComptes').then(() => {
        this.$refs.vuetable_ecriture_comptes.setData(this.computeData());
        this.loading = false;
      });
    },
    updateTable() {
      this.loading = true;
      this.$refs.vuetable_ecriture_comptes.setData(this.computeData());
      this.loading = false;
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
    computeData() {
      let svm = this;
      return this.ecritures.map((e) => ({
        ...e,
        sapeur: [svm.getSapeur(e.sapeur_id)].map(
          (s) => s ? `${s.nom} ${s.prenom}` : ''
        )[0],
      }));
    },
    ...mapMutations(['SHOW_MODAL']),
    // editEcriture() {
    //   this.$store.dispatch('resetActiveGrade')
    //   this.SHOW_MODAL('ModalSapeurPromotion')
    // },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
