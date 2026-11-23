<script setup>
import { computed } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useTuyauDiametreStore } from "../../stores/materiel/TuyauDiametre";
import { useSubmit } from "../../composables/useSubmit.js";

const diametreStore = useTuyauDiametreStore();

await diametreStore.fetchTuyauDiametres();

const diametres = computed(() => diametreStore.liste);

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();

const ajout = () => {
  showModal({ component: "ModalTuyauDiametre", data: {} });
};
const update = (elem) => {
  showModal({
    component: "ModalTuyauDiametre",
    data: { ...elem },
  });
};
const remove = async (elem) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce diamètre ?",
      "Attention, la suppression d'un diamètre est irréversible !",
    )
  ) {
    await submit(
      () => diametreStore.removeTuyauDiametre(elem.id),
      "Impossible de supprimer ce diamètre",
      "Diamètre supprimé.",
    );
  }
};

const fields = [
  { title: "Diamètre", key: "diametre" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <base-card title="Diamètres">
    <template #header>
      <button type="button" class="btn btn-primary" @click="ajout">Ajouter</button>
    </template>
    <template #body-table>
      <base-table :data="diametres" :fields="fields" :selectable="true" no-data="Aucun diamètre">
        <template #actions="{ rowData }">
          <button
            aria-label="Modifier"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="update(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            aria-label="Supprimer"
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="remove(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
