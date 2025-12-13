<script setup>
import { computed, reactive, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useMissionStore } from '../../stores/intervention/Mission.js';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { DateTime } from 'luxon';
import BaseAutocomplete from '/src/components/base/BaseAutocomplete.vue';

const sapeurStore = useSapeurStore();
const missionStore = useMissionStore();
const interventionStore = useInterventionStore();

missionStore.fetchMissions();
sapeurStore.fetchListeSapeur();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  intervention_id: interventionStore.active.id,
  ...data.mission,
  debut2: data.mission.debut?.replace(' ', 'T'),
  fin2: data.mission.fin?.replace(' ', 'T'),
});
// min = data.min;//DateTime.fromSQL(data.min)slice(0, ).toISO().slice(0, 16);
// max = data.max;//DateTime.fromSQL(data.max).toISO().slice(0, 16);

const responsableMode = ref(data?.mission?.sapeur_id ? 'sapeur_id' : 'sapeur');
const format = 'yyyy-MM-dd HH:mm';

const listMissions = computed(() => missionStore.liste);
const listeSapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const save = async () => {
  // Format back dates to SQL Format
  form.debut = DateTime.fromISO(form.debut2)?.toFormat(format);
  form.fin = DateTime.fromISO(form.fin2)?.toFormat(format);

  if (responsableMode.value == 'sapeur') {
    delete form.sapeur_id;
    if (!form.sapeur) {
      errors.value.sapeur = 'Manquant';
      return;
    }
  } else {
    delete form.sapeur;
    if (!form.sapeur_id) {
      errors.value.sapeur_id = 'Manquant';
      return;
    }
  }

  try {
    if (form.id) {
      await interventionStore.editInterventionMission(form);
    } else {
      await interventionStore.addInterventionMission(form);
    }
    closeModal();
  } catch (err) {
    errors.value = {
      ...err,
      debut: err['missions.0.debut'],
      fin: err['missions.0.fin'],
      sapeur_id: err['missions.0.sapeur_id'],
      sapeur: err['missions.0.sapeur'],
      titre: err['missions.0.titre'],
    };
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter une mission</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="form.debut2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
      </div>
      <div class="mb-3">
        <base-autocomplete
          v-model="form.titre"
          :items="listMissions.map((m) => m.titre)"
          :error="!!errors['titre']"
          title="Titre"
        />
      </div>
      <label class="form-check-label" for="flexSwitchCheckDefault">
        Responsable
      </label>
      <div class="form-check">
        <input
          id="sapeur_id"
          v-model="responsableMode"
          class="form-check-input"
          type="radio"
          name="responsable"
          value="sapeur_id"
        />
        <label class="form-check-label" for="sapeur_id">Sapeur</label>
      </div>
      <div class="form-check">
        <input
          id="sapeur"
          v-model="responsableMode"
          class="form-check-input"
          type="radio"
          name="responsable"
          value="sapeur"
        />
        <label class="form-check-label" for="sapeur">Externe au SIS</label>
      </div>
      <base-select
        v-if="responsableMode == 'sapeur_id'"
        v-model="form.sapeur_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['sapeur_id'] }"
        display-key="nom_prenom"
        :options="listeSapeurs"
      />
      <div v-if="responsableMode == 'sapeur'" class="mb-3">
        <input
          v-model="form.sapeur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['sapeur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Quittance</label>
        <input
          id="fin"
          v-model="form.fin2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
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
          :class="{ 'is-invalid': errors['resume'] }"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>
