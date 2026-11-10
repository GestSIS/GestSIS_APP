<script setup>
import { reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useBatterieTypeStore } from "../../stores/materiel/BatterieType.js";
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

const batterieStore = useBatterieTypeStore();

const { closeModal } = useModalStore();
const save = async () => {
  const { ok } = await submit(() =>
    ((form.id || 0) === 0 ? batterieStore.addBatterieType : batterieStore.updateBatterieType)(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un type de batterie</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Modèle</label>
        <input
          id="nom"
          v-model="form.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
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
