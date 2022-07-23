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
import { mapMutations } from 'vuex';

export default {
  name: 'ModalChargement',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      message: '',
      loading: true,
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    ...mapMutations(['HIDE_MODAL']),
  },
};
</script>

<style scoped></style>
