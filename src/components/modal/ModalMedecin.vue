<template>
  <div>
    <div class="modal-header">
      <h5
        class="modal-title"
        id="exampleModalLabel"
      >{{ activeMedecin.id ? 'Modifier' : 'Ajouter' }} un médecin</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeMedecin.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="adresse">Adresse</label>
        <input
          type="text"
          v-model="activeMedecin.adresse"
          class="form-control"
          :class="{ 'is-invalid': errors['adresse'] }"
          id="adresse"
        />
      </div>
      <div class="mb-3">
        <label for="localite">Localité</label>
        <select
          id="localite"
          v-model="activeMedecin.localite_id"
          class="form-select"
          :class="{ 'is-invalid': errors['localite_id'] }"
        >
          <option v-for="l in listeLocalite" :key="l.id" :value="l.id">{{ localite(l) }}</option>
        </select>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="medecin-actif-modal"
            v-model="activeMedecin.actif"
            :true-value="1"
          />
          <label class="form-check-label" for="medecin-actif-modal">Actif</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
      >{{ activeMedecin.id ? 'Modifier' : 'Ajouter' }}</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMedecin',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeMedecin: {
        actif: 1,
      },
    };
  },
  mounted() {
    this.activeMedecin = {
      ...this.activeMedecin,
      ...this.data,
    };
  },
  computed: {
    ...mapState({
      listeMedecin: (state) => state.medecin.liste,
      listeLocalite: (state) => state.localite.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    localite(localite) {
      return localite?.designation;
    },
    async save() {
      if ((this.activeMedecin.id || 0) === 0) {
        this.$store
          .dispatch('addMedecin', this.activeMedecin)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
            (this.errors = {
              ...errors,
            })
          );
      } else {
        this.$store
          .dispatch('updateMedecin', this.activeMedecin)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>

<style scoped></style>
