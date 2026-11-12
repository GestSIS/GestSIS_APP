<script setup>
import { reactive, computed } from "vue";
import { useTypeInterventionStore } from "../../stores/intervention/TypeIntervention.js";
import { useStatInterventionStore } from "../../stores/intervention/StatIntervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSubmit } from "../../composables/useSubmit.js";

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

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  name: "",
  email: "",
  admin: false,
  ...data,
});

const typeInterventionStore = useTypeInterventionStore();
const statInterventionStore = useStatInterventionStore();
const listeStatIntervention = computed(() => statInterventionStore.liste);

const { closeModal } = useModalStore();

const save = async () => {
  const { ok } = await submit(() =>
    form.id
      ? typeInterventionStore.updateTypeIntervention(form)
      : typeInterventionStore.addTypeIntervention(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un type d'intervention</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          required
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
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-select
        v-model="form.stat_intervention_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['stat_intervention_id'] }"
        label="Statistique"
        :options="listeStatIntervention"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
