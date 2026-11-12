<script setup>
import { reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSisParamStore } from "../../stores/params/SisParam.js";
import { useSubmit } from "../../composables/useSubmit.js";

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

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  email: "",
  ...data,
});

const { closeModal } = useModalStore();
const sisParamStore = useSisParamStore();

const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};

const save = async () => {
  form.email = form.email?.toLowerCase()?.trim();
  const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!form.email || !form.email.match(validRegex)) {
    errors.value["email"] = "Email invalide !";
    return;
  }

  const { ok } = await submit(
    () => sisParamStore.addSisContact({ ...form, liste: data.id }),
    "Erreur lors de l'ajout du contact",
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        Ajouter un contact à la liste <em>{{ data?.designation }}</em>
      </h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="close"></button>
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
          {{ errors["email"] }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </form>
</template>
