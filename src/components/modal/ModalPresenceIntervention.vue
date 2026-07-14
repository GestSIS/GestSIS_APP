<script setup>
import { computed, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';

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

const interventionStore = useInterventionStore();

const dateDebutMin = data.min.slice(0, 10);
const dateDebutMax = data.max.slice(0, 10);
const dateFinMin = null;
// if (!activeExerciceComptableId) return
// return (
//   activeInterventionData.value.date_debut ||
//   exerciceComptableDebut.value(
//     activeInterventionData.value.exercice_comptable_id
//   )
// )
const dateFinMax = data.max.slice(0, 10);

const editMode = data.mode === 'edit';
const date_debut = ref(data.presence?.debut?.slice(0, 10) ?? dateDebutMin);
const date_fin = ref(data.presence?.fin?.slice(0, 10) ?? dateDebutMin);
const heure_debut = ref(data.presence?.debut?.slice(11, 16));
const heure_fin = ref(data.presence?.fin?.slice(11, 16));
const errors = ref({});
const selectedSapeurs = ref(
  Object.fromEntries(data.sapeurs?.map((s) => [s, true]) ?? []),
);
const piquet = ref(data.presence?.piquet ?? false);

const sapeurStore = useSapeurStore();
const sapeurs = computed(() =>
  sapeurStore.liste.filter((s) => s.actif && s.type == 0),
);

const nbSelectedSapeurs = computed(
  () =>
    Object.keys(selectedSapeurs.value).filter((s) => selectedSapeurs.value[s])
      .length,
);

const { closeModal } = useModalStore();

const roundTime = (time, minutesToRound) => {
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  // Convert hours and minutes to time in minutes
  time = hours * 60 + minutes;

  const rounded = Math.round(time / minutesToRound) * minutesToRound;
  const rHr = '' + Math.floor(rounded / 60);
  const rMin = '' + (rounded % 60);

  return rHr.padStart(2, '0') + ':' + rMin.padStart(2, '0');
};
const roundFin = () => {
  if (heure_fin.value) {
    heure_fin.value = roundTime(heure_fin.value, 15);
  }
};
const roundDebut = () => {
  if (heure_debut.value) {
    heure_debut.value = roundTime(heure_debut.value, 15);
  }
};
const save = () => {
  const debut = date_debut.value + ' ' + heure_debut.value;
  const fin = date_fin.value + ' ' + heure_fin.value;
  if (editMode) {
    const presence = {
      ...data.presence,
      debut,
      fin,
      piquet: piquet.value,
    };
    interventionStore
      .editPresence(presence)
      .then(() => {
        (callback() ?? Promise.resolve()).then((close) => {
          if (close ?? true) {
            closeModal();
          }
        });
      })
      .catch((err) => {
        errors.value = {
          ...err,
          date_debut: err['sapeurs.0.debut'],
          date_fin: err['sapeurs.0.fin'],
          heure_debut: err['sapeurs.0.debut'],
          heure_fin: err['sapeurs.0.fin'],
        };
      });
  } else {
    let presences = [];
    Object.keys(selectedSapeurs.value)
      .filter((s) => selectedSapeurs.value[s])
      .forEach((s) => {
        presences = [
          ...presences,
          { sapeur_id: s, debut, fin, piquet: piquet.value },
        ];
      });
    interventionStore
      .addPresences(presences)
      .then(() => {
        (callback() ?? Promise.resolve()).then((close) => {
          if (close ?? true) {
            closeModal();
          }
        });
      })
      .catch((error) => {
        errors.value = {
          ...error,
          date_debut: error['sapeurs.0.debut'],
          date_fin: error['sapeurs.0.fin'],
          heure_debut: error['sapeurs.0.debut'],
          heure_fin: error['sapeurs.0.fin'],
        };
      });
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ editMode ? 'Ajouter des présences' : 'Modifier une présence' }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <div class="form-check">
          <input
            id="piquet"
            v-model="piquet"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="piquet">Piquet</label>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-date-debut">Date de début</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                id="m-int-date-debut"
                v-model="date_debut"
                required
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date_debut'] }"
                type="date"
                :min="dateDebutMin"
                :max="dateDebutMax"
                name="date_debut"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-heure_debut">Heure</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                id="m-int-heure_debut"
                v-model="heure_debut"
                required
                type="time"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['heure_debut'] }"
                name="heure_debut"
                step="900"
                @focusout="roundDebut"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-date-fin">Date de fin</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                id="m-int-date-fin"
                v-model="date_fin"
                required
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date_fin'] }"
                :min="dateFinMin"
                :max="dateFinMax"
                type="date"
                name="date_fin"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-heure_fin">Heure</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                id="m-int-heure_fin"
                v-model="heure_fin"
                required
                type="time"
                class="form-control form-control-sm"
                :class="{
                  'is-invalid': errors['heure_fin'],
                }"
                name="heure_fin"
                step="900"
                @focusout="roundFin"
              />
            </div>
          </div>
        </div>
      </div>
      <ul v-if="!editMode" class="list-group">
        <li v-for="s in sapeurs" :key="s.id" class="list-group-item">
          <div class="form-check">
            <input
              :id="'sp' + s.id"
              v-model="selectedSapeurs[s.id]"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" :for="'sp' + s.id">
              {{ s?.nom_prenom }}
            </label>
          </div>
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!nbSelectedSapeurs"
      >
        {{ editMode ? 'Enregistrer' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
