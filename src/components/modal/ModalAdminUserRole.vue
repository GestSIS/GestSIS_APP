<script setup>
import { reactive, ref, computed, watch } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAdminStore } from "../../stores/admin/Admin.js";

const adminStore = useAdminStore();

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  user_id: null,
  role_id: null,
  ...data,
});

const users = computed(() => adminStore.users);
const sis = computed(() => adminStore.sis);
const roles = computed(() => {
  const selectedUser = users.value.find((u) => u.id === form.user_id);
  const existingRoleIds = new Set((selectedUser?.user_roles || []).map((ur) => ur.role_id));

  return adminStore.roles
    .filter((r) => !existingRoleIds.has(r.id))
    .map((r) => ({
      id: r.id,
      designation: sis.value.find((s) => s.id === r.sis_id)?.api_key + " - " + r.nom,
    }));
});

// Le rôle sélectionné n'est plus forcément valide pour le nouvel utilisateur
// (déjà attribué), donc on repart d'une sélection vierge.
watch(
  () => form.user_id,
  () => {
    form.role_id = null;
  },
);

const { closeModal } = useModalStore();

const save = () =>
  adminStore
    .addUserRole(form.user_id, form.role_id)
    .then(closeModal)
    .then(() => callback(true))
    .catch((err) => (errors.value = err));
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Ajout d'un rôle à un utilisateur</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.user_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['user_id'] }"
        :options="users"
        display-key="name"
        label="Utilisateur"
      />
      <base-select
        v-model="form.role_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['role_id'] }"
        :options="roles"
        display-key="designation"
        label="Rôle"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
      <button type="submit" class="btn btn-primary">Enregistrer</button>
    </div>
  </form>
</template>
