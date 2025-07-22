<script setup>
import { inject, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  name: '',
  email: '',
  admin: false,
  ...data,
});

const store = useStore();
const listeStatIntervention = computed(
  () => store.state.statIntervention.liste,
);

const { closeModal } = useModalStore();
const awn = inject('awn');

const save = () =>
  store
    .dispatch(
      (this.form.id || 0) === 0
        ? 'addTypeIntervention'
        : 'updateTypeIntervention',
      form,
    )
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'enregistrement");
    });
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un type d'intervention
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
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
      <base-select
        v-model="form.stat_intervention_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['stat_intervention_id'] }"
        label="Statistique"
        :options="listeStatIntervention"
      />
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
