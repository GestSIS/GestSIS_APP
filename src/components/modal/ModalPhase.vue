<script setup>
import { usePhaseTypeStore } from "../../stores/intervention/PhaseType.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { DateTime } from "luxon";
import { computed, reactive, ref } from "vue";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const phaseTypeStore = usePhaseTypeStore();
const interventionStore = useInterventionStore();

const errors = ref({});
const form = reactive({
  date: null,
  heure: null,
  ...data,
});

const listePhaseType = computed(() => phaseTypeStore.liste);

const min = DateTime.fromSQL(data.min).toISO();

if (form.debut === null && form.id) {
  form.debut2 = min;
} else {
  const date = DateTime.fromSQL(form.debut);
  form.date = date.toISODate();
  form.heure = date.toLocaleString(DateTime.TIME_24_SIMPLE);
}

const { closeModal } = useModalStore();

const roundTime = (time, minutesToRound) => {
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  // Convert hours and minutes to time in minutes
  time = hours * 60 + minutes;

  let rounded = Math.round(time / minutesToRound) * minutesToRound;
  let rHr = "" + Math.floor(rounded / 60);
  let rMin = "" + (rounded % 60);

  return rHr.padStart(2, "0") + ":" + rMin.padStart(2, "0");
};
const roundHour = () => {
  form.heure = roundTime(form.heure, 15);
};
const save = async () => {
  if (!form.heure || !form.date) {
    errors.value = { ...errors.value, debut: "Données invalide" };
  }
  form.debut = form.date + " " + form.heure.slice(0, 5);

  try {
    if (form.id) {
      await interventionStore.editPhase({
        ...form,
        debut2: undefined,
      });
    } else {
      await interventionStore.addPhase({
        ...form,
        debut2: undefined,
      });
    }
    closeModal();
  } catch (err) {
    errors.value = err;
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une phase</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-sm-6 col-xl-6 mb-3">
          <div class="mb-3">
            <label for="m-int-date-debut">Début de la phase</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <!-- // TODO: Migrate to datetime-local -->
              <input
                id="m-int-date-debut"
                v-model="form.date"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['debut'] }"
                type="date"
                required
                :min="data.min.slice(0, 10)"
                :max="data.max.slice(0, 10)"
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
                v-model="form.heure"
                required
                type="time"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['debut'] }"
                name="heure_debut"
                step="900"
                @focusout="roundHour"
              />
            </div>
          </div>
        </div>
      </div>
      <base-select
        v-model="form.phase_type_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['phase_type_id'] }"
        label="Type"
        :options="listePhaseType"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
