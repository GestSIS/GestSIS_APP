<script setup>
import { ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useTuyauDiametreStore } from '../../stores/materiel/TuyauDiametre.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({
  ...data,
});

const diametreStore = useTuyauDiametreStore();

const { closeModal } = useModalStore();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? diametreStore.addTuyauDiametre
    : diametreStore.updateTuyauDiametre)(activeItem.value)
    .then(closeModal)
    .catch(
      (err) =>
        (errors.value = {
          ...err,
        }),
    );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un diamètre de tuyau
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="diametre">Diamètre</label>
        <input
          id="diametre"
          v-model="activeItem.diametre"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['diametre'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>
