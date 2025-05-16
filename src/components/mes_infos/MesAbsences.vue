<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject, ref, watch } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';
import useConfirmation from '../../hooks/useConfirmation.js';

const store = useStore();
const infosStore = useMesInfosStore();
await store.dispatch('fetchExercicesComptables');

await Promise.all([
  infosStore.fetchMesAbsences(store.state.exerciceComptable.activeId),
  store.dispatch('fetchAbsenceParams'),
]);

const activeItemId = ref(null);

const absenceParams = computed(() => store.state.absenceParam.params);
const anneeComptableId = computed(() => store.state.exerciceComptable.activeId);
const absences = computed(() =>
  infosStore.absences.sort((e1, e2) => e1.debut?.localeCompare(e2.debut)),
);

watch(anneeComptableId, () =>
  infosStore.fetchMesAbsences(anneeComptableId.value),
);

const { showModal } = useModalStore();
const { confirm } = useConfirmation();
const awn = inject('awn');
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
        ref="table"
        class="table-striped"
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

<style scoped></style>
