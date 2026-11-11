<script setup>
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";

const exerciceCategorieStore = useExerciceCategorieStore();
await exerciceCategorieStore.fetchExerciceCategories();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Désignation", key: "designation" },
  { title: "Durée de base [min]", key: "duree_base" },
  { title: "Amendable", key: "amendable", type: Boolean },
  { title: "Actif", key: "statut", type: Boolean },
  { title: "Actions", slot: "actions" },
];
const listeCategorie = computed(() =>
  exerciceCategorieStore.liste.slice().sort((a, b) => a.tri - b.tri),
);

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const ajoutCategorie = () => showModal({ component: "ModalExerciceCategorie", data: {} });
const updateCategorie = (categorie) =>
  showModal({
    component: "ModalExerciceCategorie",
    data: { ...categorie },
  });
const deleteCategorie = async (categorie) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cette catégorie ?",
      "Attention, la suppression d'une catégorie est irréversible !",
    )
  ) {
    await submit(
      () => exerciceCategorieStore.removeExerciceCategorie(categorie.id),
      "Erreur lors de la suppression",
      "Catégorie supprimée.",
    );
  }
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie()">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeCategorie"
        :fields="fields"
        no-data="Aucune catégorie"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCategorie(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCategorie(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" /></button
        ></template>
      </base-table>
    </div>
  </div>
</template>
