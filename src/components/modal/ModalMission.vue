<script setup>
import { reactive } from "vue";
import { useMissionStore } from "../../stores/intervention/Mission.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useSubmit from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  ...data,
});

const missionStore = useMissionStore();
const { closeModal } = useModalStore();

const save = async () => {
  const { ok } = await submit(async () => {
    if (form.id) {
      await missionStore.updateMission(form);
    } else {
      await missionStore.addMission(form);
    }
  });
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une mission</h5>
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
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
