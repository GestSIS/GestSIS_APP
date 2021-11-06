<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ data.title }}</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <p>{{ data.question }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="cancel()">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="confirmer()">
        Confirmer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalConfirmation',
  props: {
    data: {
      type: Object,
    },
    callback: {
      type: Function,
    },
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    cancel() {
      this.callback(false);
      this.HIDE_MODAL();
    },
    confirmer() {
      this.callback(true);
      this.HIDE_MODAL();
    },
  },
};
</script>

<style scoped></style>
