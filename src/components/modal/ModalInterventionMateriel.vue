<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter du materiel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeMateriel.materiel_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_id'] }"
        label="Matériel"
        :options="listeMateriels"
        :disabled="activeMateriel.id"
      />
      <div class="mb-3">
        <label for="remarque">Quantité</label>
        <input
          id="remarque"
          v-model="activeMateriel.quantite"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeMateriel.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalInterventionMateriel',
  data() {
    return {
      errors: {},
    };
  },
  computed: {
    ...mapState({
      activeMateriel: (state) => state.materiel.active,
      listeMateriels: (state) => state.materiel.liste,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      if ((this.activeMateriel.id || 0) === 0) {
        this.$store
          .dispatch('addInterventionMateriel', this.activeMateriel)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
                materiel_id: errors['materiels.0.materiel_id'],
                quantite: errors['materiels.0.quantite'],
              }),
          );
      } else {
        this.$store
          .dispatch('editInterventionMateriel', this.activeMateriel)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
                materiel_id: errors['materiels.0.materiel_id'],
                quantite: errors['materiels.0.quantite'],
              }),
          );
      }
    },
  },
};
</script>

<style scoped></style>
