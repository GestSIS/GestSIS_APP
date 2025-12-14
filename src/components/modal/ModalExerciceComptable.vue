<script setup>
import { reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  ...data,
});

const exerciceComptableStore = useExerciceComptableStore();
const { closeModal } = useModalStore();

const presetDebutFin = () => {
  const annee = parseInt(form.annee);
  if (!form.designation) {
    form.designation = 'Exercice comptable ' + annee;
  }
  if (!form.debut) {
    form.debut = annee + '-01-01';
    form.fin = annee + '-12-31';
  }
};

const save = async () => {
  const action =
    (form.id || 0) === 0
      ? exerciceComptableStore.addExerciceComptable
      : exerciceComptableStore.updateExerciceComptable;
  action(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un exercice comptable
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="annee">Année</label>
        <input
          id="annee"
          v-model="form.annee"
          required
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
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="form.debut"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Fin</label>
        <input
          id="fin"
          v-model="form.fin"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="exercice-comptable-boucle-modal"
            v-model="form.boucle"
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
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
