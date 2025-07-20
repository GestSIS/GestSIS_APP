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

const store = useStore();
const listeMateriels = computed(() => store.state.materiel.liste);

const errors = ref({});
const form = reactive({
  intervention_id: store.state.intervention.active.id,
  ...data,
});

const { closeModal } = useModalStore();

const save = async () =>
  store
    .dispatch(
      (form.id || 0) === 0
        ? 'addInterventionMateriel'
        : 'editInterventionMateriel',
      form,
    )
    .then(closeModal)
    .catch(
      (err) =>
        (errors.value = {
          ...err,
          materiel_id: errors['materiels.0.materiel_id'],
          quantite: errors['materiels.0.quantite'],
        }),
    );
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} du materiel
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.materiel_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_id'] }"
        label="Matériel"
        :options="listeMateriels"
        :disabled="form.id"
        :required="true"
      />
      <div class="mb-3">
        <label for="remarque">Quantité</label>
        <input
          id="remarque"
          v-model="form.quantite"
          min="1"
          required
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
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
