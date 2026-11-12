<script setup>
import { reactive, computed } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useSubmit } from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const authStore = useAuthStore();

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  name: "",
  roles: [],
  ...data,
});

const roles = computed(() => authStore.roles);

const { closeModal } = useModalStore();

const save = async () => {
  const { ok } = await submit(() => authStore.updateUserRoles(form));
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        Modification des rôles de <em>{{ form.name }}</em>
      </h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label>Rôles</label>
        <div v-for="role in roles" :key="role.id" class="form-check">
          <input
            :id="'r' + role.id"
            v-model="form.roles"
            type="checkbox"
            class="form-check-input"
            :value="role.id"
          />
          <label class="form-check-label" :for="'r' + role.id">{{ role.nom }}</label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['roles'] }">
          {{ errors["roles"] }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">Enregistrer</button>
    </div>
  </form>
</template>
