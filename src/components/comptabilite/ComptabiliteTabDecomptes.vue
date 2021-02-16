<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Décomptes</h3>
          <button @click.prevent="generer" class="btn btn-primary">
            Générer
          </button>
          <!-- <div class="dropdown">
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
            </div> -->
          <!--          <button type="button" class="btn btn-primary" @click="manageComptes">-->
          <!--            Gestion des comptes-->
          <!--          </button>-->
        </div>
        <vuetable
          v-show="!loading"
          ref="vuetable_ecriture_decomptes"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          no-data-template="Aucune écriture à afficher"
          :data-manager="dataManager"
        >
          <div
            slot="deduction"
            slot-scope="props"
            class="custom-control custom-checkbox"
          >
            <input
              type="checkbox"
              class="custom-control-input"
              id="deduction"
              :checked="props.rowData.deduction"
              disabled
            />
            <label class="custom-control-label" for="deduction"></label>
          </div>
          <!-- <div slot="actions" slot-scope="props" class="d-flex">
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 3"
              @click="imputerExercice(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div> -->
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
  await store.dispatch('fetchExercicesComptables');

  let loadDecomptes = store.dispatch('fetchDecomptes');
  Promise.all([loadDecomptes]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabDecompte',
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
          title: 'Déductions',
          name: 'deduction',
          sortField: 'deduction',
        },
        {
          title: 'Déductions AVS',
          name: 'avs_total',
          sortField: 'avs_total',
        },
        {
          title: 'Déductions AC',
          name: 'ac_total',
          sortField: 'ac_total',
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
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      listeSapeur: (state) => state.sapeur.liste,
      listeDecompte: (state) => state.decompte.liste,
    }),
    ...mapGetters(['getSapeur', 'getFonction']),
  },
  mounted() {
    this.loading = true;
    if (this.listeSapeur.length === 0) {
      this.$store.dispatch('fetchListeSapeur');
    }

    this.init();
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      store.dispatch('fetchDecomptes').then(() => {
        this.init();
      });
    },
  },
  methods: {
    init() {
      this.$refs.vuetable_ecriture_decomptes.setData(this.computeData());
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
      return this.listeDecompte;
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
