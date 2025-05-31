<script setup>
import { ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useBatterieTypeStore } from '../../stores/materiel/BatterieType.js';

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

const batterieStore = useBatterieTypeStore();

const { closeModal } = useModalStore();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? batterieStore.addBatterieType
    : batterieStore.updateBatterieType)(activeItem.value)
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
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un type de batterie
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Modèle</label>
        <input
          id="nom"
          v-model="activeItem.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
