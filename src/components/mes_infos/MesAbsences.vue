<script setup>
import { useModalStore } from '../../stores/common/Modal.js';
import { useAbsenceParamStore } from '../../stores/absence/AbsenceParam.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';

const infosStore = useMesInfosStore();
const absenceParamStore = useAbsenceParamStore();
const exerciceComptableStore = useExerciceComptableStore();

await exerciceComptableStore.fetchExercicesComptables();

absenceParamStore.fetchParams();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await infosStore.fetchMesAbsences(exerciceComptableStore.activeId);
  loading.value = false;
});

const activeItemId = ref(null);

const absenceParams = computed(() => absenceParamStore.params);
const absences = computed(() =>
  infosStore.absences.sort((e1, e2) => e1.debut?.localeCompare(e2.debut)),
);

const { showModal, confirm } = useModalStore();
const awn = useNotification();
const addAbsence = () =>
  showModal({
    component: 'ModalSAbsenter',
  });
const modifierAbsence = (absence) =>
  showModal({
    component: 'ModalSAbsenter',
    data: absence,
  });
const removeAbsence = (absence) =>
  confirm(
    'Voulez-vous vraiment supprimer votre absence ?',
    "Attention, la suppression d'une absence est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() => {
    infosStore
      .removeMonAbsence(absence)
      .then(() => awn.success('Absence supprimée avec succès'))
      .catch((err) =>
        awn.alert(err?.message ?? "Impossible de supprimer l'absence"),
      );
  });

const fields = [
  { title: 'Début', key: 'debut', type: Date },
  { title: 'Fin', key: 'fin', type: Date },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes absences</h3>
      <button
        v-if="absenceParams?.actif"
        type="button"
        class="btn btn-primary"
        @click="addAbsence"
      >
        Saisir une absence
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="absences"
        :selectable="true"
        no-data="Aucun absence de saisie"
        @selected="(elem) => (activeItemId = elem?.id)"
      >
        <template #actions="{ rowData }">
          <button
            v-if="absenceParams?.actif"
            title="modifier"
            class="btn btn-outline-primary border-0"
            @click="modifierAbsence(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="absenceParams?.actif"
            class="btn btn-outline-danger border-0"
            @click="removeAbsence(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
