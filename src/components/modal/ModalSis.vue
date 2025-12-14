<script setup>
import { inject, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useAdminStore } from '../../stores/admin/Admin.js';

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  nom: '',
  abreviation: '',
  mobile: false,
  api_key: '',
  ...data,
});

const adminStore = useAdminStore();
const { closeModal } = useModalStore();
const awn = inject('awn');

const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};

const save = async () => {
  (form?.id ? adminStore.editSis : adminStore.addSis)(form)
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'ajout du SIS");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} Sis
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="m-sis-nom">Nom</label>
        <input
          id="m-sis-nom"
          v-model="form.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
          name="nom"
          required
        />
      </div>
      <div class="mb-3">
        <label for="m-sis-abreviation">Abréviation</label>
        <input
          id="m-sis-abreviation"
          v-model="form.abreviation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
          name="m-sis-abreviation"
          required
        />
      </div>
      <div class="mb-3">
        <label for="m-sis-api_key">API KEY</label>
        <input
          id="m-sis-api_key"
          v-model="form.api_key"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['api_key'] }"
          name="m-sis-api_key"
          required
          :readonly="form?.id"
          :disabled="form?.id"
        />
      </div>
      <div class="mb-3">
        <input
          id="sis-mobile"
          v-model="form.mobile"
          name="sis-mobile"
          type="checkbox"
          class="form-check-input"
        />
        <label for="sis-mobile" class="ms-1">Mobile</label>
      </div>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="close">
        Annuler
      </button>
    </div>
  </form>
</template>
