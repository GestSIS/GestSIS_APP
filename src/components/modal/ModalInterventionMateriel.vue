<script setup>
import { computed, reactive, ref } from "vue";
import { useMaterielStore } from "../../stores/intervention/Materiel.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const materielStore = useMaterielStore();
const interventionStore = useInterventionStore();

const errors = ref({});
const form = reactive({
  intervention_id: interventionStore.active.id,
  ...data,
});

const listeMateriels = computed(() => {
  // En modification le choix du matériel est verrouillé : liste complète pour que le matériel courant reste affiché
  if (form.id) {
    return materielStore.liste;
  }
  // En ajout, ne proposer que les matériels pas encore attribués à l'intervention
  const dejaAttribues = new Set(interventionStore.active.materiels.map((m) => m.materiel_id));
  return materielStore.liste.filter((m) => !dejaAttribues.has(m.id));
});

const { closeModal } = useModalStore();

const save = async () => {
  try {
    if (form.id) {
      await interventionStore.editInterventionMateriel(form);
    } else {
      await interventionStore.addInterventionMateriel(form);
    }
    closeModal();
  } catch (err) {
    errors.value = {
      ...err,
      materiel_id: err["materiels.0.materiel_id"],
      quantite: err["materiels.0.quantite"],
    };
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} du materiel</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.materiel_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_id'] }"
        label="Matériel"
        :options="listeMateriels"
        :disabled="form.id"
        :required="true"
      />
      <div class="mb-3">
        <label for="remarque">Quantité</label>
        <input
          id="remarque"
          v-model="form.quantite"
          min="1"
          required
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
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
