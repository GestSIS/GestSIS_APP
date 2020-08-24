<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Sélectionner une excuse
      </h5>
      <button type="button" class="close" @click="close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="form-group">
      <ul class="list-group list-group-flush">
        <li
          class="list-group-item list-group-item-action"
          v-for="excuse in listeExcuseTypes"
          :key="excuse.id"
          @click="selectExcuseType(excuse.id)"
        >
          {{ excuse.designation }}
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalExcuse',
  props: ['callback'],
  computed: {
    ...mapState({
      listeExcuseTypes: state => state.excuseType.liste
    })
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selectExcuseType(excuseTypeId) {
      this.callback(excuseTypeId);
      this.HIDE_MODAL();
    },
    close() {
      this.callback(null);
      this.HIDE_MODAL();
    }
  }
};
</script>

<style scoped></style>
