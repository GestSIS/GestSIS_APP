<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter une phase</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
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
              <input
                id="m-int-date-debut"
                v-model="date"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['debut'] }"
                type="date"
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
                v-model="heure"
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
      <!-- <div class="mb-3">
      <label for="debut">Début de la phase</label>-->
      <!-- <datetime
          v-model="activePhase.debut2"
          :format="format"
          type="datetime"
          :input-class="{ 'form-control': true, 'is-invalid': errors['debut'] }"
          id="debut"
          :min-datetime="min"
          :max-datetime="max"
          :minute-step="15"
          :disabled="activePhase.debut === null && activePhase.id"
      ></datetime>-->
      <!-- <input
          type="datetime-local"
          v-model="activePhase.debut2"
          :class="{ 'form-control': true, 'is-invalid': errors['debut'] }"
          id="debut"
          :min="min"
          :max="max"
          @focusout="roundHour"
      />-->
      <!-- <input
          type="datetime-local"
          v-model="activePhase.debut2"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
          id="cours-date"
      />-->
      <!-- </div> -->
      <base-select
        v-model="activePhase.phase_type_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['phase_type_id'] }"
        label="Type"
        :options="listePhaseType"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activePhase.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'ModalPhase',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      format: 'yyyy-MM-dd HH:mm',
      min: null,
      max: null,
      date: null,
      heure: null,
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      listePhaseType: (state) => state.phaseType.liste,
      activePhase: (state) => state.phaseType.active.data,
    }),
  },
  mounted() {
    this.min = DateTime.fromSQL(this.data.min).toISO();
    this.max = DateTime.fromSQL(this.data.max).toISO();

    if (this.activePhase.debut === null && this.activePhase.id) {
      this.activePhase.debut2 = this.min;
    } else {
      const date = DateTime.fromSQL(this.activePhase.debut);
      this.date = date.toISODate();
      this.heure = date.toLocaleString(DateTime.TIME_24_SIMPLE);
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    roundTime(time, minutesToRound) {
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      // Convert hours and minutes to time in minutes
      time = hours * 60 + minutes;

      let rounded = Math.round(time / minutesToRound) * minutesToRound;
      let rHr = '' + Math.floor(rounded / 60);
      let rMin = '' + (rounded % 60);

      return rHr.padStart(2, '0') + ':' + rMin.padStart(2, '0');
    },
    roundHour() {
      this.heure = this.roundTime(this.heure, 15);
    },
    async save() {
      if (!this.heure || !this.date) {
        this.errors = { ...this.errors, debut: 'Données invalide' };
      }
      this.activePhase.debut = this.date + ' ' + this.heure.slice(0, 5);

      if ((this.activePhase.id || 0) === 0) {
        this.$store
          .dispatch('addPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
