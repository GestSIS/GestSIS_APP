<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const typeStore = useMaterielTypeStore();
const type = computed(() =>
  typeStore.liste.find((t) => t.id == data.materiel_type_id),
);

const { closeModal } = useModalStore();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? typeStore.addMaterielType
    : typeStore.updateMaterielType)(activeItem.value)
    .then(closeModal)
    .catch(
      (errors) =>
        (errors.value = {
          ...errors,
        }),
    );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Historique de l'article
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          readonly
          v-model="type.designation"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="mb-3">
        <label for="emplacement">Emplacement</label>
        <input
          id="emplacement"
          readonly
          v-model="data.emplacement"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="mb-3">
        <label for="compartiment">Compartiment</label>
        <input
          id="compartiment"
          readonly
          v-model="data.compartiment"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          readonly
          v-model="data.remarque"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
    </div>
  </div>
</template>

<style scoped></style>
