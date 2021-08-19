<template>
  <div class="row">
    <div class="col-sm-12 col-xl-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-outline-primary btn-block" @click="generer">
            Nouveau
          </button>
          <button
            class="btn btn-outline-primary btn-block"
            :disabled="!selectedId"
            @click="iso20022Decompte(selectedId)"
          >
            Fichier de paiement (ISO20022)
          </button>
          <button
            class="btn btn-outline-danger btn-block"
            :disabled="!selectedId"
            @click="supprimer(selectedId)"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Décomptes</h3>
          <button @click.prevent="generer" class="btn btn-primary">
            Nouveau
          </button>
        </div>
        <base-table
          :fields="fields"
          :data="decomptes"
          :selectable="true"
          selectKey="id"
          noData="Aucun décompte existant pour l'instant, cliquez sur le bouton 'nouveau' pour en générer un."
          @selected="selected"
        >
          <template v-slot:checkbox="{ key, value, rowData }">
            <div class="custom-control custom-checkbox">
              <input
                type="checkbox"
                class="custom-control-input"
                :id="key + '-' + rowData.id"
                :checked="value"
                disabled
              />
              <label
                class="custom-control-label"
                :for="key + '-' + rowData.id"
              ></label>
            </div>
          </template>
          <template v-slot:actions="{ value }">
            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-outline-primary border-0">
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimer(value)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import store from '@/store/index';
import DecompteService from '@/services/DecompteService.js';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  await store.dispatch('fetchExercicesComptables');

  let loadDecomptes = store.dispatch('fetchDecomptes');
  Promise.all([loadDecomptes, loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabDecompte',
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
      selectedId: 0,
      fields: [
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'total',
        },
        {
          title: 'Déductions',
          key: 'deduction',
          sortKey: 'deduction',
          slot: 'checkbox',
        },
        {
          title: 'Charges AVS',
          key: 'avs_total',
          sortKey: 'avs_total',
        },
        {
          title: 'Charges AC',
          key: 'ac_total',
          sortKey: 'ac_total',
        },
        {
          title: 'Actions',
          titleClass: 'text-center',
          key: 'id',
          slot: 'actions',
        },
      ],
    };
  },
  watch: {
    decomptes() {
      this.loading = false;
    },
    activeExerciceComptableId() {
      this.loading = true;
      store.dispatch('fetchDecomptes');
    },
  },
  computed: {
    ...mapState({
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      sapeurs: (state) => state.sapeur.liste,
      decomptes: (state) => state.decompte.liste,
    }),
    ...mapGetters(['getSapeur', 'getFonction']),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(row) {
      this.selectedId = row?.id || null;
    },
    supprimer(decompteId) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce décompte ?',
          question:
            "Attention, la suppression d'un décompte est irréversible ! Il vous sera cependant possible de générer un nouveau décompte incluant les écritures de ce décompte.",
        },
        callback: () => {
          this.$store.dispatch('removeDecompte', decompteId);
        },
      });
    },
    iso20022Decompte(decompteId) {
      const decompte = this.decomptes.find((d) => d.id === decompteId);
      DecompteService.downloadIso20022PourDecompte(
        decompteId,
        `decompte_${decompte.date}.xml`
      );
    },
    generer() {
      this.SHOW_MODAL({ component: 'ModalDecompte', data: {} });
    },
  },
};
</script>

<style>
</style>
