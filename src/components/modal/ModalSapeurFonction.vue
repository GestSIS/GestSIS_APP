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
  remarque: '',
  ...data,
});

const store = useStore();
const fonctions = computed(() =>
  store.state.fonction.liste.filter((f) => f.actif),
);

const { closeModal } = useModalStore();

const save = async () =>
  // TODO: Empêcher fonctions à double
  store
    .dispatch(
      (form.id || 0) === 0 ? 'addSapeurFonction' : 'editSapeurFonction',
      form,
    )
    .then(closeModal)
    .catch((err) => (errors.value = err));
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une fonction
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
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
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
      </div>
      <base-select
        v-model="form.fonction_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        label="Fonction"
        display-key="nom"
        :options="fonctions"
      />
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
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
