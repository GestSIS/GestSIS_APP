<script setup>
import { computed, reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAbsenceStore } from "../../stores/absence/Absence.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import useSubmit from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  sapeur_id: null,
  ...data,
});

const sapeurStore = useSapeurStore();
const absenceStore = useAbsenceStore();
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const save = async () => {
  const action = form?.id ? "updateAbsence" : "addAbsence";
  const { ok } = await submit(
    () => absenceStore[action](form),
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
      <h5 class="modal-title">{{ form?.id ? "Modifier" : "Ajouter" }} une absence</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.sapeur_id"
        :required="true"
        :disabled="form?.id"
        placeholder="<sapeur>"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs.filter((s) => s.actif && s.type == 0)"
      />
      <div class="mb-3">
        <label for="cours-date">Départ</label>
        <input
          id="debut"
          v-model="form.debut"
          required
          :max="form.fin"
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
          v-model="form.fin"
          required
          :min="form.debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
        <div v-if="errors['fin']" class="invalid-feedback">Date invalide</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form?.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
