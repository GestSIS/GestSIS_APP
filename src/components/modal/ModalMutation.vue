<script setup>
import { computed, reactive, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useModalStore } from '../../stores/common/Modal.js';

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

const localiteStore = useLocaliteStore();
const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();

//Chargement de données en prévision de la fin de service
sapeurStore.fetchSapeurExercices({
  sapeurId: sapeurStore.active.id,
  exerciceComptableId: exerciceComptableStore.activeId,
});
sapeurStore.fetchSapeurGroupes(sapeurStore.active.id);
sapeurStore.fetchSapeurFonctions(sapeurStore.active.id);

const localites = computed(() => localiteStore.liste);

const finDeService = computed(() => form.action == 'finService');

// Une date de fin vient d'être ajoutée si la mutation n'en avait pas auparavant
const sortieAjoutee = computed(() => !!form.sortie && !data.sortie);

const { closeModal, showModal } = useModalStore();

// Après l'enregistrement : si une sortie a été ajoutée et que le sapeur a des
// groupes, exercices ou fonctions, on propose de les désactiver.
const onSaved = () => {
  errors.value = {};

  if (
    sortieAjoutee.value &&
    sapeurStore.active.groupes.length +
      sapeurStore.active.exercices.length +
      sapeurStore.active.fonctions.length >
      0
  ) {
    showModal({
      component: 'ModalMutationDesactivation',
      data: { sortie: form.sortie },
    });
  } else {
    closeModal();
  }
};

const save = () => {
  if ((form.id || 0) === 0) {
    sapeurStore
      .addMutation(form)
      .then(onSaved)
      .catch((err) => (errors.value = err));
  } else {
    sapeurStore
      .editMutation(form)
      .then(onSaved)
      .catch((err) => (errors.value = err));
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une mutation
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3" :class="{ 'd-none': finDeService }">
        <label for="cours-date">Incorporation</label>
        <input
          id="incorporation"
          v-model="form.incorporation"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['incorporation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="cours-date">Fin de service</label>
        <input
          id="cours-date"
          v-model="form.sortie"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['sortie'] }"
        />
        <div v-if="errors['sortie']" class="invalid-feedback">
          Date invalide
        </div>
      </div>
      <base-select
        v-model="form.localite_id"
        :required="true"
        class="mb-3"
        :class="{ 'd-none': finDeService, 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <div class="mb-3">
        <label for="motif">Motif</label>
        <input
          id="motif"
          v-model="form.motif"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['motif'] }"
        />
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
