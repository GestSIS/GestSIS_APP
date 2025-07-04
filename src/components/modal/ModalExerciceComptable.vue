<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeExercice.id ? 'Modifier' : 'Ajouter' }} un exercice comptable
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="annee">Année</label>
        <input
          id="annee"
          v-model="activeExercice.annee"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['annee'] }"
          @focusout="presetDebutFin"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeExercice.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="activeExercice.debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Fin</label>
        <input
          id="fin"
          v-model="activeExercice.fin"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="exercice-comptable-boucle-modal"
            v-model="activeExercice.boucle"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="exercice-comptable-boucle-modal"
            >Bouclé</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeExercice.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalExercice',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeExercice: {},
    };
  },
  mounted() {
    this.activeExercice = {
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    presetDebutFin() {
      const annee = parseInt(this.activeExercice.annee);
      if (!this.activeExercice.designation) {
        this.activeExercice.designation = 'Exercice comptable ' + annee;
      }
      if (!this.activeExercice.debut) {
        this.activeExercice.debut = annee + '-01-01';
        this.activeExercice.fin = annee + '-12-31';
      }
    },
    async save() {
      if ((this.activeExercice.id || 0) === 0) {
        this.$store
          .dispatch('addExerciceComptable', this.activeExercice)
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
      } else {
        this.$store
          .dispatch('updateExerciceComptable', this.activeExercice)
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
