<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter du materiel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="materiel">Matériel</label>
        <select
          id="materiel"
          v-model="activeMateriel.materiel_id"
          class="form-select"
          :class="{ 'is-invalid': errors['materiel_id'] }"
          :disabled="activeMateriel.id"
        >
          <option v-for="m in listMateriels" :key="m.id" :value="m.id">
            {{ m.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="remarque">Quantité</label>
        <input
          type="number"
          v-model="activeMateriel.quantite"
          class="form-control"
          :class="{ 'is-invalid': errors['quantite'] }"
          id="remarque"
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
import { mapState, mapMutations } from 'vuex';

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
      listMateriels: (state) => state.materiel.liste,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
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
              })
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
              })
          );
      }
    },
  },
};
</script>

<style scoped></style>
