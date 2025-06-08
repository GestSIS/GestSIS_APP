<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Impression liste Foad</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Date</label>
        <input
          id="date"
          v-model="date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button
        ref="cancelButton"
        type="button"
        class="btn btn-secondary"
        @click="cancel()"
      >
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="confirmer()">
        Confirmer
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import SapeurService from '../../services/SapeurService';

export default {
  name: 'ModalConfirmation',
  data() {
    return {
      date: new Date().toISOString().slice(0, 10),
      errors: {},
    };
  },
  mounted() {
    this.$refs.cancelButton.focus();
  },
  methods: {
    ...mapActions(useModalStore, {
      SHOW_MODAL: 'showModal',
      HIDE_MODAL: 'closeModal',
    }),
    cancel() {
      this.HIDE_MODAL();
    },
    confirmer() {
      this.SHOW_MODAL({ component: 'ModalChargement' });
      SapeurService.listeFoad(this.date)
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((error) => {
          this.$awn.warning(
            error?.message ?? 'Erreur lors de la génération de la liste Foad',
          );
          this.HIDE_MODAL();
        });
    },
  },
};
</script>

<style scoped></style>
