<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Chargement en cours ...
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
    <div v-if="done" class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalChargement',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      message: '',
      loading: true,
      done: false,
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
  },
};
</script>
