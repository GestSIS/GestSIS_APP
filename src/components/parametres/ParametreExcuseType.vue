<script setup>
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";

const excuseTypeStore = useExcuseTypeStore();
await excuseTypeStore.fetchExcuseTypes();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Abréviation", key: "abreviation" },
  { title: "Désignation", key: "designation" },
  { title: "Amende", key: "amende", type: Boolean },
  {
    title: "Disponibilité",
    key: "statut",
    formatter: (statut) =>
      ({
        0: "Désactivé",
        1: "Exercice + S'excuser",
        2: "Exercice",
      })[statut],
  },
  { title: "Actions", slot: "actions" },
];
const listeExcuse = computed(() => excuseTypeStore.liste.slice().sort((a, b) => a.tri - b.tri));

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const ajoutExcuse = () => showModal({ component: "ModalExcuseType", data: {} });
const updateExcuse = (excuse) => showModal({ component: "ModalExcuseType", data: { ...excuse } });
const deleteExcuse = async (excuse) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce type d'excuse ?",
      "Attention, la suppression d'un type d'excuse est irréversible !",
    )
  ) {
    await submit(
      () => excuseTypeStore.removeExcuseType(excuse.id),
      "Erreur lors de la suppression",
      "Type d'excuse supprimé.",
    );
  }
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Excuses types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutExcuse()">
        Ajouter une excuse
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeExcuse"
        :fields="fields"
        no-data="Aucune excuse type"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExcuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteExcuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
