<script setup>
import { reactive, ref } from "vue";
import { useStatInterventionStore } from "../../stores/intervention/StatIntervention.js";
import { useModalStore } from "../../stores/common/Modal.js";

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

const statInterventionStore = useStatInterventionStore();
const { closeModal } = useModalStore();

const save = async () => {
  try {
    if (form.id) {
      await statInterventionStore.updateStatIntervention(form);
    } else {
      await statInterventionStore.addStatIntervention(form);
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
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une catégorie statistique</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
