<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
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

const store = useStore();

//Chargement de données en prévision de la fin de service
store.dispatch('fetchSapeurExercices', {
  sapeurId: store.state.sapeur.active.id,
  exerciceComptableId: store.state.exerciceComptable.activeId,
});
store.dispatch('fetchSapeurGroupes', store.state.sapeur.active.id);
store.dispatch('fetchSapeurFonctions', store.state.sapeur.active.id);

const localites = computed(() => store.state.localite.liste);

const finDeService = computed(() => form.action == 'finService');

const { closeModal, showModal } = useModalStore();

const save = () => {
  if ((form.id || 0) === 0) {
    store
      .dispatch('addMutation', form)
      .then(closeModal)
      .catch((err) => (errors.value = err));
  } else {
    store
      .dispatch('editMutation', form)
      .then(() => {
        errors.value = {};

        if (
          (finDeService.value || (!form.sortie && !!form.sortie)) &&
          store.state.sapeur.active.groupes.length +
            store.state.sapeur.active.exercices.length +
            store.state.sapeur.active.fonctions.length >
            0
        ) {
          showModal('ModalMutationDesactivation');
        } else {
          closeModal();
        }
      })
      .catch((err) => (errors.value = err));
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
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
