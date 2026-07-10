<script setup>
import { ref, reactive, watch } from 'vue';
import { useControleStore } from '../../stores/materiel/Controle.js';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  id: data?.id ?? null,
  controle_id: data?.controle_id ?? null,
  order: data?.order ?? 1,
  nom: data?.nom ?? '',
  description: data?.description ?? '',
  type: data?.type ?? 'BOOLEAN',
  unit: data?.unit ?? '',
  value_min: data?.value_min ?? '',
  value_max: data?.value_max ?? '',
});

watch(
  () => form.type,
  () => {
    form.unit = '';
    form.value_min = '';
    form.value_max = '';
  },
);

const store = useControleStore();
const { closeModal } = useModalStore();

const save = () => {
  errors.value = {};
  const payload = {
    ...form,
    unit: form.type === 'NUMERIC' ? form.unit || null : null,
    value_min: form.type === 'NUMERIC' && form.value_min !== '' ? form.value_min : null,
    value_max: form.type === 'NUMERIC' && form.value_max !== '' ? form.value_max : null,
  };
  (form.id
    ? store.updateTache(form.controle_id, payload)
    : store.addTache(form.controle_id, payload))
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une tâche
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-3 mb-3">
          <label for="order">Ordre <span class="text-danger">*</span></label>
          <input
            id="order"
            v-model="form.order"
            type="number"
            min="1"
            step="1"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['order'] }"
          />
        </div>
        <div class="col-9 mb-3">
          <label for="nom">Nom <span class="text-danger">*</span></label>
          <input
            id="nom"
            v-model="form.nom"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['nom'] }"
          />
          <div v-if="errors['nom']" class="invalid-feedback">{{ errors['nom'][0] }}</div>
        </div>
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control form-control-sm"
          rows="2"
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="type">Type <span class="text-danger">*</span></label>
        <select
          id="type"
          v-model="form.type"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['type'] }"
        >
          <option value="BOOLEAN">Booléen (OK / NOK / NA)</option>
          <option value="NUMERIC">Numérique (valeur mesurée)</option>
        </select>
      </div>
      <template v-if="form.type === 'NUMERIC'">
        <div class="mb-3">
          <label for="unit">Unité</label>
          <input
            id="unit"
            v-model="form.unit"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['unit'] }"
            placeholder="Ex : bar, mm, °C"
          />
        </div>
        <div class="row">
          <div class="col-6 mb-3">
            <label for="value_min">Valeur min</label>
            <input
              id="value_min"
              v-model="form.value_min"
              type="number"
              step="any"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['value_min'] }"
            />
          </div>
          <div class="col-6 mb-3">
            <label for="value_max">Valeur max</label>
            <input
              id="value_max"
              v-model="form.value_max"
              type="number"
              step="any"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['value_max'] }"
            />
          </div>
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>
