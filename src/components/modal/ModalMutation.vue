<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">{{ modalTitle }}</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3" :class="{ 'd-none': finDeService }">
        <label for="cours-date">Incorporation</label>
        <input
          id="incorporation"
          v-model="activeMutation.incorporation"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['incorporation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="cours-date">Fin de service</label>
        <input
          id="cours-date"
          v-model="activeMutation.sortie"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['sortie'] }"
        />
        <div v-if="errors['sortie']" class="invalid-feedback">
          Date invalide
        </div>
      </div>
      <base-select
        v-model="activeMutation.localite_id"
        class="mb-3"
        :class="{ 'd-none': finDeService, 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <div class="mb-3">
        <label for="motif">Motif</label>
        <input
          id="motif"
          v-model="activeMutation.motif"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['motif'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ buttonValidateText }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalMutation',
  data() {
    return {
      errors: {},
      modalTitle: 'Ajouter une mutation',
      mutationInitiale: {},
      groupes: [],
      exercices: [],
      fonctions: [],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      activeMutation: (state) => state.mutation.active,
      localites: (state) => state.localite.liste,
    }),
    finDeService() {
      return this.activeMutation.action == 'finService';
    },
    buttonValidateText() {
      if (this.finDeService) {
        return 'Valider';
      }

      return this.activeMutation.id ? 'Modifier' : 'Ajouter';
    },
  },
  mounted() {
    if (this.finDeService) {
      this.modalTitle = 'Fin de service';
    }
    if (this.localites.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }

    //Chargement de données en prévision de la fin de service

    this.mutationInitiale = Object.assign({}, this.activeMutation);
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store.dispatch('fetchGroupes', this.activeSapeurId);

    this.$store
      .dispatch('fetchSapeurExercices', this.activeSapeurId)
      .then((data) => (this.exercices = data));
    this.$store
      .dispatch('fetchSapeurGroupes', this.activeSapeurId)
      .then((data) => (this.groupes = data));
    this.$store
      .dispatch('fetchSapeurFonctions', this.activeSapeurId)
      .then((data) => (this.fonctions = data));
  },
  methods: {
    ...mapActions(useModalStore, {
      SHOW_MODAL: 'showModal',
      HIDE_MODAL: 'closeModal',
    }),
    async save() {
      if ((this.activeMutation.id || 0) === 0) {
        this.$store
          .dispatch('addMutation', this.activeMutation)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editMutation', this.activeMutation)
          .then(() => {
            this.errors = {};

            if (
              (this.finDeService ||
                (!this.mutationInitiale.sortie &&
                  !!this.activeMutation.sortie)) &&
              this.groupes.length +
                this.exercices.length +
                this.fonctions.length >
                0
            ) {
              this.SHOW_MODAL('ModalMutationDesactivation');
            } else {
              this.HIDE_MODAL();
            }
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
