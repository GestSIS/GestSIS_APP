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
    <div class="col-12 col-sm-6 col-lg-8 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Impressions</h3>
        </div>
        <div class="card-body row g-2">
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              :disabled="!selectedId"
              @click="impressionStandard(selectedId)"
            >
              Impression
            </button>
          </div>
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              :disabled="!selectedId"
              @click="impressionParSapeur(selectedId)"
            >
              Impression par sapeur
            </button>
          </div>
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              :disabled="!selectedId"
              @click="impressionParCompte(selectedId)"
            >
              Impression par compte
            </button>
          </div>
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              :disabled="!selectedId"
              @click="iso20022Decompte(selectedId)"
            >
              Fichier de paiement (ISO20022)
            </button>
          </div>
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              :disabled="!selectedId"
              @click="excelAFacturer(selectedId)"
            >
              A facturer (Excel)
            </button>
          </div>
          <div class="col-6">
            <button
              class="btn btn-outline-primary col-12"
              @click="certificatsDeSalaire()"
            >
              Certificats de salaire
            </button>
          </div>
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
          :detail-row-column="true"
          :detail-row-component="detailRowComponent"
          :detail-row-options="detailRowOptions"
          detail-row-class="m-td-0"
          no-data="Aucun décompte existant pour l'instant, cliquez sur le bouton 'nouveau' pour en générer un."
          @selected="selected"
        >
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

import GenericDetailsRow from '../table/GenericDetailsRow.vue';

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
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    const svm = this;
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      dropdown: false,
      loading: true,
      selectedId: 0,
      detailRowOptions: {
        fields: [
          {
            title: 'Designation',
            key: 'designation',
          },
          {
            title: 'Date',
            key: 'date',
            type: Date,
          },
          {
            title: 'Sapeur',
            key: 'sapeur_id',
            formatter: (sapeurId) => {
              return svm.sapeurs.find((e) => e.id == sapeurId)?.nom_prenom;
            },
          },
          {
            title: 'Quantité',
            key: 'quantite',
          },
          {
            title: 'Unité',
            key: 'type_unite_id',
            formatter: (id) => svm.unites.find((u) => u.id == id)?.abreviation,
          },
          {
            title: 'Tarif',
            key: 'tarif',
          },
          {
            title: 'Tarif min',
            key: 'tarif_min',
          },
          {
            title: 'Pour',
            key: 'tarif_min_pour',
          },
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
          {
            title: 'Total',
            key: 'total',
          },
        ],
      },
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
          type: 'date',
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
          type: Boolean,
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
        getData: () => DecompteService.getEcritures(d.id),
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
    excelAFacturer(decompteId) {
      const decompte = this.decomptes.find((d) => d.id == decompteId);
      DecompteService.downloadExcelAFacturer(
        decompteId,
        `decompte_${decompte.date}_a_facturer.xlsx`
      ).catch((err) => {
        this.$awn.alert(
          err?.message ||
            "Erreur lors de la génération du fichier excel, contactez l'administrateur système"
        );
      });
    },
    certificatsDeSalaire() {
      // TODO: Ajouter année dans le nom du certificat de salaire
      DecompteService.downloadCertificatSalaires(
        this.activeExerciceComptableId,
        `certificats_salaire.pdf`
      ).catch((err) => {
        this.$awn.alert(
          err?.message ||
            "Erreur lors de la génération des certificats de salaire, contactez l'administrateur système"
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
