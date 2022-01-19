<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeExercice.id ? 'Modifier' : 'Ajouter' }} un exercice comptable
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="annee">Année</label>
        <input
          type="text"
          v-model="activeExercice.annee"
          class="form-control"
          :class="{ 'is-invalid': errors['annee'] }"
          id="annee"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeExercice.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          type="date"
          v-model="activeExercice.debut"
          class="form-control"
          :class="{ 'is-invalid': errors['debut'] }"
          id="debut"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Fin</label>
        <input
          type="date"
          v-model="activeExercice.fin"
          class="form-control"
          :class="{ 'is-invalid': errors['fin'] }"
          id="fin"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="exercice-comptable-boucle-modal"
            v-model="activeExercice.boucle"
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
import { mapMutations } from 'vuex';

export default {
  name: 'ModalExercice',
  props: {
    data: {
      type: Object,
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
    ...mapMutations(['HIDE_MODAL']),
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
              })
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

<style scoped></style>
