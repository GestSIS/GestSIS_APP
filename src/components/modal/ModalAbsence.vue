<script setup>
import { computed, reactive, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAbsenceStore } from "../../stores/absence/Absence.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  sapeur_id: null,
  ...data,
});

const sapeurStore = useSapeurStore();
const absenceStore = useAbsenceStore();
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();
const awn = useNotification();

const save = async () => {
  const action = form?.id ? "updateAbsence" : "addAbsence";
  absenceStore[action](form)
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Impossible d'ajouter cette absence");
    });
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
      <button type="submit" class="btn btn-primary">
        {{ form?.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
