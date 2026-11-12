<script setup>
import MesInfosService from "../../services/MesInfosService";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { computed, ref, watchEffect } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { exportFileName } from "../../tools/index.js";
import { useDownload } from "../../composables/useDownload.js";

const infosStore = useMesInfosStore();
const exerciceComptableStore = useExerciceComptableStore();

const exerciceComptableId = computed(() => exerciceComptableStore.activeId);

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await infosStore.fetchMesDecomptes(exerciceComptableStore.activeId);
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
  exerciceComptableStore.liste.find((e) => e.id == exerciceComptableStore.activeId),
);

const { download } = useDownload();
const awn = useNotification();

const downloadDecompte = (paiement) => {
  const filename = exportFileName(["decompte", paiement.date], "pdf");

  download(
    () => MesInfosService.printMonDecompte(paiement.decompte_id, filename),
    "Erreur lors de la génération de votre décompte",
  );
};

const resumeAnnuel = () => {
  if (paiements.value.length == 0) {
    awn.alert(
      "Veuillez attendre que votre SIS ait généré un décompte avant de pouvoir télécharger votre certificat de salaire",
    );
    return;
  }
  if (exerciceComptable.value && Date.now() < new Date(exerciceComptable.value.fin)) {
    awn.warning(
      "Attention, ce résumé n'est pas définitif et peut encore évoluer car l'année comptable n'est pas encore terminée !",
    );
  }
  const filename = exportFileName(["resume-annuel", exerciceComptable.value?.annee], "pdf");

  download(
    () => MesInfosService.downloadMonResumeAnnuel(exerciceComptableId.value, filename),
    "Erreur lors de la génération de votre résumé annuel",
  );
};

const certificatSalaire = () => {
  if (paiements.value.length == 0) {
    awn.alert(
      "Veuillez attendre que votre SIS ait généré un décompte avant de pouvoir télécharger votre certificat de salaire",
    );
    return;
  }
  if (exerciceComptable.value && Date.now() < new Date(exerciceComptable.value.fin)) {
    awn.warning(
      "Attention, ce certificat de salaire n'est pas définitif et peut encore évoluer car l'année comptable n'est pas encore terminée !",
    );
  }
  const filename = exportFileName(["certificat-salaire", exerciceComptable.value?.annee], "pdf");

  download(
    () => MesInfosService.downloadMonCertificatSalaire(exerciceComptableId.value, filename),
    "Erreur lors de la génération de votre certificat de salaire",
  );
};

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Décompte", key: "decompte" },
  { title: "Solde", key: "solde" },
  { title: "Indemnité", key: "indemnite" },
  { title: "Frais forfaitaires", key: "frais_forfaitaire" },
  { title: "Frais effectifs", key: "frais_effectif" },
  { title: "Retenue AVS/AC", key: "avs_ac" },
  { title: "Autre", key: "autre" },
  { title: "Total", key: "total" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes décomptes</h3>
      <button class="btn btn-primary" @click="certificatSalaire">Certificat de salaire</button>
      <button class="btn btn-primary" @click="resumeAnnuel">Résumé annuel</button>
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
            aria-label="Télécharger le décompte"
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
