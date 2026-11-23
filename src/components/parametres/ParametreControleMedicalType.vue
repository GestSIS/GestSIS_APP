<script setup>
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";

const controleMedicalTypeStore = useControleMedicalTypeStore();
await controleMedicalTypeStore.fetchTypes();

const fields = [
  { title: "Tri", key: "tri" },
  { title: "Désignation", key: "designation" },
  { title: "Remarque", key: "remarque" },
  { title: "Validité [ans]", key: "duree_validite" },
  { title: "Expirable", key: "expirable", type: Boolean },
  { title: "Actions", slot: "actions" },
];
const listeType = computed(() =>
  controleMedicalTypeStore.liste.slice().sort((a, b) => a.tri - b.tri),
);

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const ajoutType = () => showModal({ component: "ModalControleMedicalType", data: {} });
const updateType = (type) =>
  showModal({
    component: "ModalControleMedicalType",
    data: { ...type },
  });
const deleteType = async (type) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce type de contrôle médical ?",
      "Attention, la suppression d'un type de contrôle médical est irréversible !",
    )
  ) {
    await submit(
      () => controleMedicalTypeStore.removeType(type.id),
      "Erreur lors de la suppression",
      "Type de contrôle médical supprimé.",
    );
  }
};
</script>

<template>
  <base-card title="Contrôles médicaux types">
    <template #header>
      <button type="button" class="btn btn-primary" @click="ajoutType">
        Ajouter une nouveau type
      </button>
    </template>
    <template #body-table>
      <base-table
        :data="listeType"
        :fields="fields"
        no-data="Aucun contrôle médical type"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            aria-label="Modifier"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" /></button
        ></template>
      </base-table>
    </template>
  </base-card>
</template>
