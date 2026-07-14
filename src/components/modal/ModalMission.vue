<script setup>
import { reactive, ref } from 'vue';
import { useMissionStore } from '../../stores/intervention/Mission.js';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  ...data,
});

const missionStore = useMissionStore();
const { closeModal } = useModalStore();

const save = async () => {
  try {
    if (form.id) {
      await missionStore.updateMission(form);
    } else {
      await missionStore.addMission(form);
    }
    closeModal();
  } catch (err) {
    errors.value = err;
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une mission
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="titre">Titre</label>
        <input
          id="titre"
          v-model="form.titre"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['titre'] }"
        />
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
