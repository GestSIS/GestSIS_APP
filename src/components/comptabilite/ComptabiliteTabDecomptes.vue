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
            class="btn btn-outline-danger"
            :disabled="!selectedId"
            @click="supprimer(selectedId)"
          >Supprimer</button>
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Impressions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedId"
            @click="impression(selectedId)"
          >Impression</button>
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedId"
            @click="iso20022Decompte(selectedId)"
          >Fichier de paiement (ISO20022)</button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Décomptes</h3>
          <button @click.prevent="generer" class="btn btn-primary">Nouveau</button>
        </div>
        <base-table
          :fields="fields"
          :data="decomptes"
          :selectable="true"
          selectKey="id"
          no-data="Aucun décompte existant pour l'instant, cliquez sur le bouton 'nouveau' pour en générer un."
          @selected="selected"
          row-selected-class="table-primary"
        >
          <template v-slot:checkbox="{ key, value, rowData }">
            <input
              type="checkbox"
              class="form-check-input"
              :id="key + '-' + rowData.id"
              :checked="value"
              disabled
            />
          </template>
          <template v-slot:actions="{ value }">
            <button type="button" class="btn btn-outline-primary border-0">
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button type="button" class="btn btn-outline-danger border-0" @click="supprimer(value)">
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
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
          titleClass: 'text-center',
          key: 'deduction',
          sortKey: 'deduction',
          slot: 'checkbox',
          columnClass: 'align-middle text-center',
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
          columnClass: 'text-center align-middle',
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
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(row) {
      this.selectedId = row?.id || null;
    },
    async supprimer(decompteId) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce décompte ?',
          question:
            "Attention, la suppression d'un décompte est irréversible ! Il vous sera cependant possible de générer un nouveau décompte incluant les écritures de ce décompte.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeDecompte', decompteId);
          }
        },
      });
    },
    impression(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadDecompte(
        decompteId,
        `decompte_${decompte.date}.xml`
      ).catch((err) => {
        this.$awn.alert(
          err?.data?.message ||
          "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système"
        );
      });
    },
    iso20022Decompte(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadIso20022PourDecompte(
        decompteId,
        `decompte_${decompte.date}.xml`
      ).catch((err) => {
        this.$awn.alert(
          err?.data?.message ||
          "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système"
        );
      });
    },
    generer() {
      this.SHOW_MODAL({ component: 'ModalDecompte', data: {} });
    },
  },
};
</script>

<style></style>
