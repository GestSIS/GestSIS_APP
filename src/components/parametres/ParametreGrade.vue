<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';

const store = useStore();
await store.dispatch('fetchGrades');

const fields = [
  { title: 'Tri', key: 'tri' },
  { title: 'Abréviation', key: 'abreviation' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Groupe', key: 'groupeDesignation' },
  { title: 'Actions', slot: 'actions' },
];

const listeGrade = computed(() =>
  store.state.grade.liste
    .map((g) => ({
      ...g,
      groupeDesignation: {
        1: 'Officier',
        2: 'Sous-Officier',
        3: 'Sapeur',
      }[g?.groupe ?? 0],
    }))
    .sort((a, b) => b.tri - a.tri),
);

const { showModal } = useModalStore();
const awn = inject('awn');
const ajoutGrade = () => showModal({ component: 'ModalGrade', data: {} });
const updateGrade = (grade) =>
  showModal({ component: 'ModalGrade', data: { ...grade } });
const deleteGrade = (grade) =>
  store
    .dispatch('removeGrade', grade.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Grades</h3>
      <button type="button" class="btn btn-primary" @click="ajoutGrade()">
        Ajouter un grade
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeGrade"
        :fields="fields"
        no-data="Aucun grade"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
