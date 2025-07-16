<script setup>
import { inject, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

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
  email: '',
  ...data,
});

const store = useStore();
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
  form.email = form.email?.toLowerCase()?.trim();
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!form.email || !form.email.match(validRegex)) {
    errors.value['email'] = 'Email invalide !';
    return;
  }

  store
    .dispatch('addSisContact', { ...form, liste: data.id })
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'ajout du contact");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Ajouter un contact à la liste <em>{{ data?.designation }}</em>
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-sis-email">Email</label>
        <input
          id="m-sis-email"
          v-model="form.email"
          autofocus
          type="email"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['email'] }"
          name="email"
          required
        />
        <div v-if="errors['email']" class="invalid-feedback">
          {{ errors['email'] }}
        </div>
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
