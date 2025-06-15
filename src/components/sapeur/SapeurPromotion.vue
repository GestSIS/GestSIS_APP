<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import useHasPermission from '../../hooks/usePermission.js';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';

const store = useStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchSapeurGrades', store.state.sapeur.active.id);
  loading.value = false;
});
await store.dispatch('fetchGrades');

const activeSapeurGrades = computed(() =>
  store.state.sapeur.active.grades
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((g) => ({
      ...g,
      designation: store.state.grade.liste.find(
        (grade) => grade.id == g.grade_id,
      )?.designation,
    })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();
const newGrade = () => {
  store.dispatch('resetActiveGrade');
  showModal('ModalSapeurPromotion');
};
const editGrade = (grade) => {
  store.dispatch('updateActiveGrade', Object.assign({}, grade));
  showModal('ModalSapeurPromotion');
};
const supprimerGrade = (grade) =>
  confirm(
    'Voulez-vous vraiment supprimer ce grade ?',
    "Attention, la suppression d'un grade est irréversible ! Toutes les données de ce grade seront perdues !",
  ).then(() => store.dispatch('removeSapeurGrade', grade?.id));

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Désignation', key: 'designation' },
  { title: 'Remarques', key: 'remarques' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Promotions</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newGrade"
      >
        Ajouter une promotion
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="activeSapeurGrades"
        no-data="Aucun grade"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
