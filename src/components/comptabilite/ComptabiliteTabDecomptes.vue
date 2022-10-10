<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body d-grid gap-1">
          <button class="btn btn-outline-primary" @click="generer">
            Nouveau
          </button>
          <button
            class="btn btn-outline-danger"
            :disabled="!selectedId"
            @click="supprimer(selectedId)"
          >
            Supprimer
          </button>
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
            @click="impressionStandard(selectedId)"
          >
            Impression
          </button>
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedId"
            @click="impressionParSapeur(selectedId)"
          >
            Impression par sapeur
          </button>
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedId"
            @click="impressionParCompte(selectedId)"
          >
            Impression par compte
          </button>
          <button
            class="btn btn-outline-primary"
            :disabled="!selectedId"
            @click="iso20022Decompte(selectedId)"
          >
            Fichier de paiement (ISO20022)
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
          <button class="btn btn-primary" @click.prevent="generer">
            Nouveau
          </button>
        </div>
        <base-table
          :fields="fields"
          :data="computedDecomptes"
          :selectable="true"
          :detail-row-component="detailRow"
          detail-row-class="m-td-0"
          select-key="id"
          no-data="Aucun décompte existant pour l'instant, cliquez sur le bouton 'nouveau' pour en générer un."
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
          <template #checkbox="{ key, value, rowData }">
            <input
              :id="key + '-' + rowData.id"
              type="checkbox"
              class="form-check-input"
              :checked="value"
              disabled
            />
          </template>
          <template #actions="{ value }">
            <!-- <button type="button" class="btn btn-outline-primary border-0">
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>-->
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              @click="supprimer(value)"
            >
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
import { markRaw } from 'vue';
import store from '@/store/index';
import DecompteService from '@/services/DecompteService.js';

import BaseTable from '@/components/table/BaseTable.vue';
import FraisEcritureDetailsVue from './FraisEcritureDetails.vue';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadUnites = store.dispatch('fetchUnites');
  await store.dispatch('fetchExercicesComptables');

  const loadDecomptes = store.dispatch('fetchDecomptes');
  Promise.all([loadDecomptes, loadSapeurs, loadUnites]).then(() => {
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
    const svm = this;
    return {
      detailRow: markRaw(FraisEcritureDetailsVue),
      dropdown: false,
      loading: true,
      selectedId: 0,
      ecritureColumns: [
        {
          title: 'Designation',
          field: 'designation',
        },
        {
          title: 'Date',
          field: 'date',
        },
        {
          title: 'Sapeur',
          field: 'sapeur_id',
          formatter: (sapeurId) => {
            const sapeur = svm.sapeurs.find((e) => e.id == sapeurId);
            return sapeur.nom + ' ' + sapeur.prenom;
          },
        },
        {
          title: 'Quantité',
          field: 'quantite',
        },
        {
          title: 'Unité',
          field: 'type_unite_id',
          formatter: (id) => svm.unites.find((u) => u.id == id)?.abreviation,
        },
        {
          title: 'Tarif',
          field: 'tarif',
        },
        {
          title: 'Tarif min',
          field: 'tarif_min',
        },
        {
          title: 'Pour',
          field: 'tarif_min_pour',
        },
        {
          title: 'Type',
          field: 'type',
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
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          formatter(value) {
            return new Date(value).toLocaleDateString();
          },
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
  computed: {
    ...mapState({
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      sapeurs: (state) => state.sapeur.liste,
      decomptes: (state) => state.decompte.liste,
      unites: (state) => state.unite.liste,
    }),
    computedDecomptes() {
      return this.decomptes.map((d) => ({
        ...d,
        columns: this.ecritureColumns,
        getEcritures: () => DecompteService.getEcritures(d.id),
      }));
    },
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
    impressionStandard(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadDecompte(
        decompteId,
        `decompte_${decompte.date}.pdf`
      ).catch((err) => {
        this.$awn.alert(
          err?.message ||
            "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système"
        );
      });
    },
    impressionParSapeur(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadDecompteParSapeur(
        decompteId,
        `decompte_${decompte.date}.pdf`
      ).catch((err) => {
        this.$awn.alert(
          err?.message ||
            "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système"
        );
      });
    },
    impressionParCompte(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadDecompteParCompte(
        decompteId,
        `decompte_${decompte.date}.pdf`
      ).catch((err) => {
        this.$awn.alert(
          err?.message ||
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
          err?.message ||
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
