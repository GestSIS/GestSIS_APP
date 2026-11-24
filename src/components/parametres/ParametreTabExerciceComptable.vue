<script setup>
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";

const exerciceComptableStore = useExerciceComptableStore();
await exerciceComptableStore.fetchExercicesComptables();

const fields = [
  { title: "Année", key: "annee" },
  { title: "Désignation", key: "designation" },
  { title: "Début", key: "debut", type: Date },
  { title: "Fin", key: "fin", type: Date },
  { title: "Bouclé", key: "boucle", type: Boolean },
  { title: "Actions", slot: "actions" },
];

const listeExerciceComptable = computed(() => exerciceComptableStore.liste);

const { showModal } = useModalStore();
const newExerciceComptable = () => showModal({ component: "ModalExerciceComptable", data: {} });
const updateExerciceComptable = (exercice) =>
  showModal({
    component: "ModalExerciceComptable",
    data: { ...exercice },
  });
</script>

<template>
  <base-card title="Exercices comptables">
    <template #header>
      <button type="button" class="btn btn-primary" @click="newExerciceComptable">
        Ajouter un exercice comptable
      </button>
    </template>
    <template #body-table>
      <base-table
        :data="listeExerciceComptable"
        :fields="fields"
        :selectable="true"
        no-data="Aucun exercice comptable"
      >
        <template #actions="{ rowData }">
          <button
            aria-label="Modifier"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExerciceComptable(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <!-- TODO Implement Suppression exercice comptable -->
          <button
            v-if="false"
            aria-label="Supprimer"
            type="button"
            class="btn btn-outline-danger border-0"
            disabled
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
