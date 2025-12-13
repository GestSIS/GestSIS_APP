<script setup>
import { computed, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useAuthStore } from '../../stores/auth/Auth.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const authStore = useAuthStore();

const errors = ref({});
const form = reactive({
  permissions: [],
  sis_id: authStore.sis.activeId,
  ...data,
});

const permissions = computed(() =>
  authStore.permissions.sort((a, b) => a.tri - b.tri),
);

const { closeModal } = useModalStore();

const save = async () => {
  authStore[form.id ? 'updateRole' : 'createRole'](form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un rôle
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          id="nom"
          v-model="form.nom"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          id="description"
          v-model="form.description"
          type="text"
          required
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Permissions</label>
        <div
          v-for="permission in permissions"
          :key="permission.id"
          class="form-check"
        >
          <input
            :id="'r' + permission.id"
            v-model="form.permissions"
            type="checkbox"
            class="form-check-input"
            :value="permission.id"
          />
          <label class="form-check-label" :for="'r' + permission.id">{{
            permission.nom
          }}</label>
        </div>
        <div
          class="invalid-feedback"
          :class="{ 'd-block': errors['permissions'] }"
        >
          {{ errors['permissions'] }}
        </div>
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
