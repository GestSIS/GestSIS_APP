<script setup>
import { computed, reactive, ref } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { DateTime } from "luxon";
import useSubmit from "../../composables/useSubmit.js";

const responsableOptions = [
  { value: "aucun", label: "Aucun" },
  { value: "sapeur_id", label: "Sapeur" },
  { value: "sapeur", label: "Externe au SIS" },
];

const sapeurStore = useSapeurStore();
const interventionStore = useInterventionStore();
sapeurStore.fetchSapeurs();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  intervention_id: interventionStore.active.id,
  ...data.jalon,
  date_time2: DateTime.fromSQL(data.jalon.date_time)?.toISO()?.slice(0, 16),
});
const format = "yyyy-MM-dd HH:mm";

const min = DateTime.fromSQL(data.min)?.toISO();
const max = DateTime.fromSQL(data.max)?.toISO();

const responsableMode = ref(
  data?.jalon?.sapeur_id ? "sapeur_id" : data?.jalon?.sapeur ? "sapeur" : "aucun",
);
const listeSapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const save = async () => {
  // Format back dates to SQL Format
  form.date_time = DateTime.fromISO(form.date_time2).toFormat(format);

  if (responsableMode.value == "sapeur") {
    delete form.sapeur_id;
    if (!form.sapeur) {
      errors.value["jalons.0.sapeur"] = "Manquant";
      return;
    }
  } else if (responsableMode.value == "sapeur_id") {
    delete form.sapeur;
    if (!form.sapeur_id) {
      errors.value["jalons.0.sapeur_id"] = "Manquant";
      return;
    }
  } else {
    form.sapeur_id = null;
    form.sapeur = null;
  }

  const { ok } = await submit(() =>
    form.id
      ? interventionStore.editInterventionJalon(form)
      : interventionStore.addInterventionJalon(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un jalon</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="heure">Heure</label>
        <input
          id="heure"
          v-model="form.date_time2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['jalons.0.date_time'] }"
          :min="min"
          :max="max"
        />
      </div>
      <div class="mb-3">
        <label for="titre">Titre</label>
        <input
          id="titre"
          v-model="form.titre"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['jalons.0.titre'] }"
        />
      </div>
      <div class="mb-3">
        <label class="form-label d-block">Responsable</label>
        <base-radio
          v-model="responsableMode"
          button-style
          size="sm"
          label="Responsable"
          :options="responsableOptions"
        />
      </div>
      <base-select
        v-if="responsableMode == 'sapeur_id'"
        v-model="form.sapeur_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['jalons.0.sapeur_id'] }"
        display-key="nom_prenom"
        :options="listeSapeurs"
      />
      <div v-if="responsableMode == 'sapeur'" class="mb-3">
        <input
          v-model="form.sapeur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['jalons.0.sapeur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['jalons.0.description'] }"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="button" class="btn btn-primary" @click="save()">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </div>
</template>
