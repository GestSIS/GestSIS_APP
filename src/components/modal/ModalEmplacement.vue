<script setup>
import { ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const emplacementStore = useEmplacementStore();
await emplacementStore.fetchEmplacements();

const errors = ref({});
const emplacement = ref({
  statut: 1,
  ...data,
  type_unite_id: data.type_unite_id ?? 0,
});

const { closeModal } = useModalStore();
const save = async () => {
  ((emplacement.id || 0) === 0
    ? emplacementStore.addEmplacement
    : emplacementStore.updateEmplacement)(emplacement)
    .then(() => {
      errors = {};
      closeModal;
    })
    .catch(
      (errors) =>
        (errors = {
          ...errors,
        }),
    );
};
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ emplacement.id ? 'Modifier' : 'Ajouter' }} un emplacement
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body overflow-visible">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="emplacement.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <select-emplacement
        v-model="emplacement.parent_id"
        label="Emplacement parent"
        :emplacementIdToIgnore="emplacement.id"
        class="mb-3"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        {{ emplacement.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
