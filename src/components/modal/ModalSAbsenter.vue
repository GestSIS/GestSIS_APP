<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos.js";
import useSubmit from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const infosStore = useMesInfosStore();
const { errors, isSubmitting, submit } = useSubmit();
const activeAbsence = ref({ ...data });

const { closeModal } = useModalStore();

const save = async () => {
  const action = activeAbsence.value?.id ? infosStore.editMonAbsence : infosStore.addMonAbsence;

  const { ok } = await submit(
    () => action(activeAbsence.value),
    "Impossible d'ajouter cette absence",
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ activeAbsence?.id ? "Modifier" : "Ajouter" }} une absence</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Départ</label>
        <input
          id="debut"
          v-model="activeAbsence.debut"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
        <div v-if="errors['debut']" class="invalid-feedback">Date invalide</div>
      </div>
      <div class="mb-3">
        <label for="cours-date">Retour</label>
        <input
          id="cours-date"
          v-model="activeAbsence.fin"
          required
          type="date"
          :min="activeAbsence.debut"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
        <div v-if="errors['fin']" class="invalid-feedback">Date invalide</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ activeAbsence?.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
