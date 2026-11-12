<script setup>
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";

const ecritureCategorieStore = useEcritureCategorieStore();
await ecritureCategorieStore.fetchEcritureCategories();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Désignation", key: "designation" },
  { title: "Actions", slot: "actions" },
];
const listeCategorie = computed(() =>
  ecritureCategorieStore.liste.slice().sort((a, b) => a.tri - b.tri),
);

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();

const ajoutCategorie = () => showModal({ component: "ModalEcritureCategorie", data: {} });

const updateCategorie = (categorie) =>
  showModal({
    component: "ModalEcritureCategorie",
    data: { ...categorie },
  });

const deleteCategorie = async (compteId) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer cette catégorie ?",
      "Attention, la suppression d'une catégorie est irréversible !",
    )
  ) {
    await submit(
      () => ecritureCategorieStore.removeEcritureCategorie(compteId),
      "Erreur lors de la suppression",
      "Catégorie supprimée.",
    );
  }
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories comptables</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie">
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
            aria-label="Modifier"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCategorie(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            aria-label="Supprimer"
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCategorie(rowData.id)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
