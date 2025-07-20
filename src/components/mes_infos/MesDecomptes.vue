<script setup>
import { useModalStore } from '../../stores/common/Modal.js';
import MesInfosService from '../../services/MesInfosService';
import { useStore } from 'vuex';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';
import { computed, inject, ref, watchEffect } from 'vue';

const store = useStore();
const infosStore = useMesInfosStore();

const exerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

await store.dispatch('fetchExercicesComptables');

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await infosStore.fetchMesDecomptes(store.state.exerciceComptable.activeId);
  loading.value = false;
});

const paiements = computed(() =>
  infosStore.paiements
    .map((e) => ({
      ...e,
    }))
    .sort((e1, e2) => e1.date.localeCompare(e2.date)),
);
const exerciceComptable = computed(() =>
  store.state.exerciceComptable.liste.find(
    (e) => e.id == store.state.exerciceComptable.activeId,
  ),
);

const { showModal, closeModal } = useModalStore();
const awn = inject('awn');

const downloadDecompte = (paiement) => {
  const filename = `${paiement.date}_decompte.pdf`;

  showModal({ component: 'ModalChargement' });
  MesInfosService.printMonDecompte(paiement.decompte_id, filename)
    .then(closeModal)
    .catch((error) => {
      awn.warning(
        error?.message ?? 'Erreur lors de la génération de votre décompte',
      );
      closeModal();
    });
};

const resumeAnnuel = () => {
  if (paiements.value.length == 0) {
    awn.alert(
      'Veuillez attendre que votre SIS ait généré un décompte avant de pouvoir télécharger votre certificat de salaire',
    );
    return;
  }
  if (Date.now() < new Date(exerciceComptable.value.fin)) {
    awn.warning(
      "Attention, ce résumé n'est pas définitif et peut encore évoluer car l'année comptable n'est pas encore terminée !",
    );
  }
  const filename = `${exerciceComptable.value?.annee}_resume.pdf`;

  showModal({ component: 'ModalChargement' });

  MesInfosService.downloadMonResumeAnnuel(exerciceComptableId.value, filename)
    .then(closeModal)
    .catch((error) => {
      awn.warning(
        error?.message ?? 'Erreur lors de la génération de votre résumé annuel',
      );
      closeModal();
    });
};

const certificatSalaire = () => {
  if (paiements.value.length == 0) {
    awn.alert(
      'Veuillez attendre que votre SIS ait généré un décompte avant de pouvoir télécharger votre certificat de salaire',
    );
    return;
  }
  if (Date.now() < new Date(exerciceComptable.value.fin)) {
    awn.warning(
      "Attention, ce certificat de salaire n'est pas définitif et peut encore évoluer car l'année comptable n'est pas encore terminée !",
    );
  }
  const filename = `${exerciceComptable.value?.annee}_certificat_salaire.pdf`;

  showModal({ component: 'ModalChargement' });

  MesInfosService.downloadMonCertificatSalaire(
    exerciceComptableId.value,
    filename,
  )
    .then(closeModal)
    .catch((error) => {
      awn.warning(
        error?.message ??
          'Erreur lors de la génération de votre certificat de salaire',
      );
      closeModal();
    });
};

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Décompte', key: 'decompte' },
  { title: 'Solde', key: 'solde' },
  { title: 'Indemnité', key: 'indemnite' },
  { title: 'Frais forfaitaires', key: 'frais_forfaitaire' },
  { title: 'Frais effectifs', key: 'frais_effectif' },
  { title: 'Retenue AVS/AC', key: 'avs_ac' },
  { title: 'Autre', key: 'autre' },
  { title: 'Total', key: 'total' },
  { title: 'Actions', slot: 'actions', key: 'id' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes décomptes</h3>
      <button class="btn btn-primary" @click="certificatSalaire">
        Certificat de salaire
      </button>
      <button class="btn btn-primary" @click="resumeAnnuel">
        Résumé annuel
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="paiements"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun décompte pour le moment"
      >
        <template #actions="{ rowData }">
          <button
            class="btn btn-outline-primary border-0"
            @click="downloadDecompte(rowData)"
          >
            <font-awesome-icon :icon="['far', 'file-pdf']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
