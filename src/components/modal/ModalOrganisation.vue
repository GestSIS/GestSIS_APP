<script setup>
import { reactive, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAdminStore } from "../../stores/admin/Admin.js";

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
  nom: "",
  abreviation: "",
  mobile: false,
  org_key: "",
  ...data,
});

const adminStore = useAdminStore();
const { closeModal } = useModalStore();
const awn = useNotification();

const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};

const save = async () => {
  (form?.id ? adminStore.editOrganisation : adminStore.addOrganisation)(form)
    .then(callback)
    .then(closeModal)
    .catch((err) => {
      errors.value = err.errors ?? {};
      awn.alert(err?.message ?? "Erreur lors de l'ajout de l'organisation");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une organisation</h5>
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
        <label for="m-sis-org_key">ORG KEY</label>
        <input
          id="m-sis-org_key"
          v-model="form.org_key"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['org_key'] }"
          name="m-sis-org_key"
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
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </form>
</template>
