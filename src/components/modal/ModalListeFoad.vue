<script setup>
import { inject, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import SapeurService from '../../services/SapeurService';

const date = ref(new Date().toISOString().slice(0, 10));

const { showModal, closeModal } = useModalStore();
const awn = inject('awn');

const confirmer = () => {
  showModal({ component: 'ModalChargement' });
  SapeurService.listeFoad(date.value)
    .catch((error) => {
      awn.warning(
        error?.message ?? 'Erreur lors de la génération de la liste Foad',
      );
    })
    .then(closeModal);
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Impression liste Foad</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Date</label>
        <input
          id="date"
          v-model="date"
          type="date"
          class="form-control form-control-sm"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button
        autofocus
        type="button"
        class="btn btn-secondary"
        @click="closeModal"
      >
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="confirmer()">
        Confirmer
      </button>
    </div>
  </div>
</template>
