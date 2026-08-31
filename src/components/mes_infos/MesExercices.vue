<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import { exercicesToIcs } from "../../tools/exportExercices";
import ExerciceService from "../../services/ExerciceService";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos.js";
import { useExcuseParamStore } from "../../stores/exercice/ExcuseParam.js";
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";

const authStore = useAuthStore();
const uniteStore = useUniteStore();
const localiteStore = useLocaliteStore();
const infosStore = useMesInfosStore();
const excuseParamStore = useExcuseParamStore();
const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceComptableStore = useExerciceComptableStore();

Promise.all([
  uniteStore.fetchUnites(),
  localiteStore.fetchLocalites(),
  exerciceCategorieStore.fetchExerciceCategories(),
  excuseTypeStore.fetchExcuseTypes(),
  excuseParamStore.fetchParams(),
]);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  if (exerciceComptableStore.activeId === null) {
    await exerciceComptableStore.fetchExercicesComptables();
  }
  await infosStore.fetchMesExercices(exerciceComptableStore.activeId);
  loading.value = false;
});

const excuseParams = computed(() => excuseParamStore.params);
const annee = computed(
  () => exerciceComptableStore.liste.find((e) => e.id == exerciceComptableStore.activeId)?.annee,
);
const sisKey = computed(() => authStore.sis.activeKey);
const sisName = computed(
  () => authStore.sis.liste.find((s) => s.id == authStore.sis.activeId)?.nom,
);
const exercices = computed(() =>
  infosStore.exercices
    .map((e) => ({
      ...e.presence,
      ...e,
      excuse: excuseTypeStore.liste.find((t) => t.id == e.presence.excuse_type_id)?.designation,
      localite: localiteStore.liste.find((l) => l.id == e.localite_id)?.designation,
      categorie: exerciceCategorieStore.liste.find((c) => c.id == e.exercice_categorie_id)
        ?.designation,
    }))
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const download = () => {
  if (exercices.value.length <= 0) {
    awn.value.alert("Aucun exercice à exporter");
  }
  exercicesToIcs(exercices.value, sisName.value, sisKey.value, annee.value);
};
const addExcuse = (exercice) => {
  showModal({
    component: "ModalSExcuser",
    data: {
      exercices: exercices.value,
      exerciceId: exercice?.id,
    },
  });
};
const removeExcuse = (exercice) =>
  confirm(
    "Voulez-vous vraiment supprimer votre excuse ?",
    "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() =>
    infosStore
      .removeMonExcuse(exercice)
      .then(() => awn.success("Excuse supprimée avec succès"))
      .catch((err) => awn.alert(err?.message ?? "Impossible de supprimer l'excuse")),
  );

const downloadJustificatif = (exercice) => {
  ExerciceService.downloadMonExcuseJustificatif(exercice.exercice_id, "justificatif.pdf").catch(
    (err) => awn.alert(err?.message ?? "Erreur lors du chargement du justificatif"),
  );
};
const onRowClass = (dataItem) => (dataItem.statut == 0 ? "table-danger" : "");

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Heure", key: "heure", formatter: (h) => h?.slice(0, 5) },
  { title: "Categorie", key: "categorie" },
  { title: "Exercice", key: "designation" },
  { title: "Durée [min]", key: "duree" },
  { title: "Localité", key: "localite" },
  { title: "Lieu", key: "lieu" },
  { title: "Communications", key: "communications" },
  { title: "Convoqué", type: Boolean, key: "convoque" },
  { title: "Présent", type: Boolean, key: "present" },
  { title: "Absent", type: Boolean, key: "absent" },
  { title: "Remplacé", type: Boolean, key: "remplace" },
  { title: "Excuse", slot: "excuse", key: "excuse_type_id" },
  { title: "Amende", type: Boolean, key: "amende" },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes exercices</h3>
      <button v-if="excuseParams?.actif" type="button" class="btn btn-primary" @click="addExcuse">
        S'excuser
      </button>
      <button type="button" class="btn btn-primary" @click="download">
        Télécharger fichier <em>iCalendrier</em>
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="exercices"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun exercice pour le moment"
        :row-class="onRowClass"
      >
        <template #excuse="{ rowData }">
          <div class="text-center">
            <span
              v-if="rowData.excuse_type_id && rowData.excuse_type_id !== true"
              class="badge rounded-pill text-bg-primary"
              :class="{
                'text-bg-danger': rowData.excuse_statut == -1,
                'text-bg-secondary': rowData.excuse_statut == 0,
                'text-bg-success': rowData.excuse_statut == 1,
              }"
              >{{ rowData?.excuse }}</span
            >
            <button
              v-if="rowData.justificatif_filename"
              class="btn"
              @click="downloadJustificatif(rowData)"
            >
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
            <button
              v-if="
                excuseParams?.actif &&
                rowData.convoque &&
                !rowData.excuse_type_id &&
                rowData.statut != 0
              "
              class="btn btn-outline-primary border-0"
              @click="addExcuse(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
            <button
              v-else-if="excuseParams?.actif && rowData.statut != 0"
              class="btn btn-outline-danger border-0"
              @click="removeExcuse(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </div>
        </template>
      </base-table>
    </div>
  </div>
</template>
