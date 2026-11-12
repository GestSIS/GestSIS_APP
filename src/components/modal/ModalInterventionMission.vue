<script setup>
import { computed, reactive, ref } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useMissionStore } from "../../stores/intervention/Mission.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "../../tools/index.js";
import BaseAutocomplete from "/src/components/base/BaseAutocomplete.vue";
import { useSubmit } from "../../composables/useSubmit.js";

const responsableOptions = [
  { value: "sapeur_id", label: "Sapeur" },
  { value: "sapeur", label: "Externe au SIS" },
];

const sapeurStore = useSapeurStore();
const missionStore = useMissionStore();
const interventionStore = useInterventionStore();

missionStore.fetchMissions();
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
  ...data.mission,
  debut2: toDateTimeLocalValue(data.mission.debut),
  fin2: toDateTimeLocalValue(data.mission.fin),
});
// min = data.min;//DateTime.fromSQL(data.min)slice(0, ).toISO().slice(0, 16);
// max = data.max;//DateTime.fromSQL(data.max).toISO().slice(0, 16);

const responsableMode = ref(data?.mission?.sapeur_id ? "sapeur_id" : "sapeur");

const listMissions = computed(() => missionStore.liste);
const listeSapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const save = async () => {
  // Format back dates to SQL Format
  form.debut = fromDateTimeLocalValue(form.debut2);
  form.fin = fromDateTimeLocalValue(form.fin2);

  if (responsableMode.value == "sapeur") {
    delete form.sapeur_id;
    if (!form.sapeur) {
      errors.value["missions.0.sapeur"] = "Manquant";
      return;
    }
  } else {
    delete form.sapeur;
    if (!form.sapeur_id) {
      errors.value["missions.0.sapeur_id"] = "Manquant";
      return;
    }
  }

  const { ok } = await submit(() =>
    form.id
      ? interventionStore.editInterventionMission(form)
      : interventionStore.addInterventionMission(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Ajouter une mission</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="form.debut2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['missions.0.debut'] }"
        />
      </div>
      <div class="mb-3">
        <base-autocomplete
          v-model="form.titre"
          :items="listMissions.map((m) => m.titre)"
          :error="!!errors['missions.0.titre']"
          title="Titre"
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
        :class="{ 'is-invalid': errors['missions.0.sapeur_id'] }"
        display-key="nom_prenom"
        :options="listeSapeurs"
      />
      <div v-if="responsableMode == 'sapeur'" class="mb-3">
        <input
          v-model="form.sapeur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['missions.0.sapeur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Quittance</label>
        <input
          id="fin"
          v-model="form.fin2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['missions.0.fin'] }"
        />
        <!-- :min="form.debut2 || min"
        :max="max"-->
      </div>
      <div class="mb-3">
        <label for="resume">Résumé</label>
        <textarea
          id="resume"
          v-model="form.resume"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['missions.0.resume'] }"
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
