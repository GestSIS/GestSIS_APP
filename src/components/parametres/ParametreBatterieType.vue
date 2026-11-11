<script setup>
import { computed } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useBatterieTypeStore } from "../../stores/materiel/BatterieType";
import { useSubmit } from "../../composables/useSubmit.js";

const batterieStore = useBatterieTypeStore();

await batterieStore.fetchBatterieTypes();
const batteries = computed(() => batterieStore.liste);

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();

const ajout = () => {
  showModal({ component: "ModalBatterieType", data: {} });
};
const update = (elem) => {
  showModal({
    component: "ModalBatterieType",
    data: { ...elem },
  });
};
const remove = async (elem) => {
  if (
    !(await confirm(
      "Voulez-vous vraiment supprimer cette batterie ?",
      "Attention, la suppression d'une batterie est irréversible !",
    ))
  ) {
    return;
  }
  await submit(
    () => batterieStore.removeBatterieType(elem.id),
    "Impossible de supprimer cette batterie",
    "Batterie supprimée.",
  );
};

const fields = [
  { title: "Designation", key: "nom" },
  { title: "actions", slot: "actions" },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Batterie types</h3>
      <button type="button" class="btn btn-primary" @click="ajout">Ajouter</button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="batteries"
        :fields="fields"
        :selectable="true"
        no-data="Aucune batterie type"
      >
        <template #actions="{ rowData }">
          <button type="button" class="btn btn-outline-primary border-0" @click="update(rowData)">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            :disabled="isSubmitting"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="remove(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
