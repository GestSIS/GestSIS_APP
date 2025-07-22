<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();

const errors = ref({});
const form = reactive({
  permissions: [],
  sis_id: store.state.auth.sis.activeId,
  ...data,
});

const permissions = computed(() =>
  store.state.auth.permissions.sort((a, b) => a.tri - b.tri),
);

const { closeModal } = useModalStore();

const save = async () => {
  store
    .dispatch((form.id || 0) === 0 ? 'createRole' : 'updateRole', form)
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
