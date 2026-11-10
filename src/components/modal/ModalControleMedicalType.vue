<script setup>
import { reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";
import useSubmit from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  expirable: false,
  actif: 1,
  ...data,
});

const controleMedicalTypeStore = useControleMedicalTypeStore();
const { closeModal } = useModalStore();

const save = async () => {
  const { ok } = await submit(async () => {
    if (form?.id) {
      await controleMedicalTypeStore.updateType(form);
    } else {
      await controleMedicalTypeStore.addType(form);
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
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un contrôle médical type</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
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
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <textarea
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
      <div class="mb-3">
        <label for="validite">Validité</label>
        <input
          id="validite"
          v-model="form.duree_validite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="type-expirable-modal"
            v-model="form.expirable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="type-expirable-modal">Expirable</label>
        </div>
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
