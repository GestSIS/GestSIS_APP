<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeCategorie.id ? 'Modifier' : 'Ajouter' }} une catégorie
        comptable
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeCategorie.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeCategorie.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCategorie.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalEcriturecategorie',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeCategorie: {},
    };
  },
  mounted() {
    this.activeCategorie = {
      ...this.activeCategorie,
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      const action = this.activeCategorie?.id
        ? 'updateEcritureCategorie'
        : 'addEcritureCategorie';
      this.$store
        .dispatch(action, this.activeCategorie)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            }),
        );
    },
  },
};
</script>

<style scoped></style>
