<script setup>
import { reactive, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAdminStore } from "../../stores/admin/Admin.js";

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
  name: "",
  email: "",
  admin: false,
  ...data,
});

const { closeModal } = useModalStore();
const awn = useNotification();
const adminStore = useAdminStore();

const save = () => {
  if (!form?.id) {
    return awn.alert("Impossible d'ajouter un utilisateur pour le moment");
  }
  adminStore
    .editUser(form)
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} Utilisateur</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="m-user-name">Nom</label>
        <input
          id="m-user-name"
          v-model="form.name"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['name'] }"
          name="name"
          required
          min="1"
        />
      </div>
      <div class="mb-3">
        <label for="m-user-email">Email</label>
        <input
          id="m-user-email"
          v-model="form.email"
          type="email"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['email'] }"
          name="m-user-email"
          required
        />
      </div>
      <div class="mb-3">
        <input
          id="user-admin"
          v-model="form.admin"
          name="user-admin"
          type="checkbox"
          class="form-check-input"
        />
        <label for="user-admin" class="ms-1">Admin</label>
      </div>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="closeModal">Annuler</button>
    </div>
  </form>
</template>
