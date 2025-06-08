<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeCompte.id ? 'Modifier' : 'Ajouter' }} un compte
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input
          id="numero"
          v-model="activeCompte.numero"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeCompte.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-select
        v-model="activeCompte.produit"
        class="mb-3"
        label="Type comptable"
        :options="[
          { id: 0, designation: 'Charge' },
          { id: 1, designation: 'Produit' },
        ]"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCompte.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalCompte',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeCompte: {},
    };
  },
  mounted() {
    this.activeCompte = {
      ...this.activeCompte,
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      const action = this.activeCompte?.id ? 'updateCompte' : 'addCompte';
      this.$store
        .dispatch(action, this.activeCompte)
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
