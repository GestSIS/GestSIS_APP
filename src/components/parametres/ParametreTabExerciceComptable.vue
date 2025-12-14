<script setup>
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed } from 'vue';

const exerciceComptableStore = useExerciceComptableStore();
await exerciceComptableStore.fetchExercicesComptables();

const fields = [
  { title: 'Année', key: 'annee' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Début', key: 'debut', type: Date },
  { title: 'Fin', key: 'fin', type: Date },
  { title: 'Bouclé', key: 'boucle', type: Boolean },
  { title: 'Actions', slot: 'actions' },
];

const listeExerciceComptable = computed(() =>
  exerciceComptableStore.liste.sort((a, b) => b.annee - a.annee),
);

const { showModal } = useModalStore();
const newExerciceComptable = () =>
  showModal({ component: 'ModalExerciceComptable', data: {} });
const updateExerciceComptable = (exercice) =>
  showModal({
    component: 'ModalExerciceComptable',
    data: { ...exercice },
  });
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices comptables</h3>
      <button
        type="button"
        class="btn btn-primary"
        @click="newExerciceComptable"
      >
        Ajouter un exercice comptable
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeExerciceComptable"
        :fields="fields"
        :selectable="true"
        no-data="Aucun exercice comptable"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExerciceComptable(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <!-- TODO Implement Suppression exercice comptable -->
          <button
            v-if="false"
            type="button"
            class="btn btn-outline-danger border-0"
            disabled
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
