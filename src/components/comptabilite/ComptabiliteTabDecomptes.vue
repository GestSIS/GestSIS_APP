<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useDecompteStore } from '../../stores/comptabilite/Decompte.js';
import { useModalStore } from '../../stores/common/Modal.js';
import DecompteService from '/src/services/DecompteService.js';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import permissions from '../../composables/permissions.js';
import useHasPermission from '../../composables/usePermission.js';

const sapeurStore = useSapeurStore();
const uniteStore = useUniteStore();
const exerciceComptableStore = useExerciceComptableStore();
const decompteStore = useDecompteStore();

await exerciceComptableStore.fetchExercicesComptables();

sapeurStore.fetchListeSapeur();
uniteStore.fetchUnites();

const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await decompteStore.fetchDecomptes(activeExerciceComptableId.value);
  loading.value = false;
});

const selectedId = ref(null);
const selected = (row) => (selectedId.value = row?.id ?? null);

const exercicesComptables = computed(() => exerciceComptableStore.liste);
const sapeurs = computed(() => sapeurStore.liste);
const decomptes = computed(() => decompteStore.liste);
const unites = computed(() => uniteStore.liste);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);
const computedData = computed(() =>
  decomptes.value.map((d) => ({
    ...d,
    getData: () => DecompteService.getEcritures(d.id),
  })),
);

const awn = useNotification();
const { closeModal, confirm, showModal } = useModalStore();

const supprimer = (decompteId) => {
  confirm(
    'Voulez-vous vraiment supprimer ce décompte ?',
    "Attention, la suppression d'un décompte est irréversible ! Il vous sera cependant possible de générer un nouveau décompte incluant les écritures de ce décompte.",
  ).then(() =>
    decompteStore
      .removeDecompte(decompteId)
      .catch((err) =>
        awn.alert(err?.message ?? "Impossible d'effectuer cette action"),
      ),
  );
};
const impressionResumeParSapeur = () => {
  showModal({ component: 'ModalChargement' });

  DecompteService.downloadResumeParSapeur(
    activeExerciceComptableId.value,
    `resume_par_sapeur.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message || 'Erreur lors de la génération du résumé par sapeur',
      );
    });
};
const impressionStandard = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadDecompte(decompteId, `decompte_${decompte.date}.pdf`)
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système",
      );
    });
};
const impressionParSapeur = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadDecompteParSapeur(
    decompteId,
    `decompte_${decompte.date}.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système",
      );
    });
};
const impressionParCompte = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadDecompteParCompte(
    decompteId,
    `decompte_${decompte.date}.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
      );
    });
};
const iso20022Decompte = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadIso20022PourDecompte(
    decompteId,
    `decompte_${decompte.date}.xml`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier ISO20022, contactez l'administrateur système",
      );
    });
};
const excelAFacturer = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadExcelAFacturer(
    decompteId,
    `decompte_${decompte.date}_a_facturer.xlsx`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier excel, contactez l'administrateur système",
      );
    });
};
const exportEcritures = (decompteId) => {
  const decompte = decomptes.value.find((d) => d.id == decompteId);

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadExcelEcritures(
    decompteId,
    `decompte_${decompte.date}_ecritures.xlsx`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération du fichier excel, contactez l'administrateur système",
      );
    });
};
const certificatsDeSalaire = () => {
  if (decomptes.value.length === 0) {
    return awn.warning(
      'Impossible de générer les certificats de salaire sans décompte !',
    );
  }

  const annee = exercicesComptables.value.find(
    (e) => e.id == activeExerciceComptableId.value,
  )?.annee;

  showModal({ component: 'ModalChargement' });

  DecompteService.downloadCertificatSalaires(
    activeExerciceComptableId.value,
    `certificats_salaire_${annee}.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          "Erreur lors de la génération des certificats de salaire, contactez l'administrateur système",
      );
    });
};
const generer = () => showModal({ component: 'ModalDecompte', data: {} });

const detailRowOptions = {
  fields: [
    { title: 'Designation', key: 'designation' },
    { title: 'Date', key: 'date', type: Date },
    {
      title: 'Sapeur',
      key: 'sapeur_id',
      formatter: (sapeurId) =>
        sapeurs.value.find((e) => e.id == sapeurId)?.nom_prenom,
    },
    { title: 'Quantité', key: 'quantite' },
    {
      title: 'Unité',
      key: 'type_unite_id',
      formatter: (id) => unites.value.find((u) => u.id == id)?.abreviation,
    },
    { title: 'Tarif', key: 'tarif' },
    { title: 'Tarif min', key: 'tarif_min' },
    { title: 'Pour', key: 'tarif_min_pour' },
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
    { title: 'Total', key: 'total' },
  ],
};
const fields = [
  { title: 'Designation', key: 'designation' },
  { title: 'Date', key: 'date', type: Date },
  { title: 'A payer', key: 'a_payer_total' },
  { title: 'A facturer', key: 'a_facturer_total' },
  { title: 'Déductions', key: 'deduction', type: Boolean },
  { title: 'Charges AVS', key: 'avs_total' },
  { title: 'Charges AC', key: 'ac_total' },
  { title: 'Total', key: 'total' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

<template>
  <div class="row">
    <div v-if="hasEditPermission" class="col-12 col-sm-6 col-lg-4 col-xl-3">
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
              Impression simple
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
              @click="impressionResumeParSapeur"
            >
              Résumé complet par sapeur
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

    <div class="col-12 col-sm-3 col-lg-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Export</h3>
        </div>
        <div class="card-body row g-2">
          <button
            class="btn btn-outline-primary col-12"
            :disabled="!selectedId"
            @click="exportEcritures(selectedId)"
          >
            Ecritures (Excel)
          </button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Décomptes</h3>
          <button class="btn btn-primary" @click.prevent="generer">
            Nouveau
          </button>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            :fields="fields"
            :data="computedData"
            :selectable="true"
            :detail-row-column="true"
            no-data="Aucun décompte existant pour l'instant, cliquez sur le bouton 'nouveau' pour en générer un."
            @selected="selected"
          >
            <template #detail-row="{ rowData }">
              <generic-details-row
                :options="detailRowOptions"
                :row-data="rowData"
              />
            </template>
            <template #actions="{ value }">
              <!-- <button type="button" class="btn btn-outline-primary border-0">
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>-->
              <button
                v-if="hasEditPermission"
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
  </div>
</template>
