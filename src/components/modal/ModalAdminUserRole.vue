<script setup>
import { reactive, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

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

const store = useStore();
const users = computed(() => store.state.admin.users);
const sis = computed(() => store.state.admin.sis);
const roles = computed(() =>
  store.state.admin.roles.map((r) => ({
    id: r.id,
    designation:
      sis.value.find((s) => s.id === r.sis_id)?.api_key + ' - ' + r.nom,
  })),
);

const { closeModal } = useModalStore();

const save = () =>
  store
    .dispatch('addUserRole', form)
    .then(closeModal())
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
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">Enregistrer</button>
    </div>
  </form>
</template>
