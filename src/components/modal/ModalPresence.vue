<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter des présences</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="piquet" v-model="piquet" />
          <label class="form-check-label" for="piquet">Piquet</label>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-date-debut">Date de début</label>
            <div class="input-group">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date_debut'] }"
                type="date"
                :min="dateDebutMin"
                :max="dateDebutMax"
                id="m-int-date-debut"
                name="date_debut"
                v-model="date_debut"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-heure_debut">Heure</label>
            <div class="input-group">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                type="time"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['heure_debut'] }"
                id="m-int-heure_debut"
                name="heure_debut"
                step="900"
                v-model="heure_debut"
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
            <div class="input-group">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date_fin'] }"
                :min="dateFinMin"
                :max="dateFinMax"
                type="date"
                id="m-int-date-fin"
                name="date_fin"
                v-model="date_fin"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="mb-3">
            <label for="m-int-heure_fin">Heure</label>
            <div class="input-group">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                type="time"
                class="form-control form-control-sm"
                :class="{
                  'is-invalid': errors['heure_fin'],
                }"
                id="m-int-heure_fin"
                name="heure_fin"
                step="900"
                v-model="heure_fin"
                @focusout="roundFin"
              />
            </div>
          </div>
        </div>
      </div>
      <ul class="list-group" v-if="!editMode">
        <li v-for="s in sapeurs" :key="s.id" class="list-group-item">
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              :id="'sp' + s.id"
              v-model="selectedSapeurs[s.id]"
            />
            <label class="form-check-label" :for="'sp' + s.id">
              {{
              formatSapeur(s)
              }}
            </label>
          </div>
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
        :disabled="!nbSelectedSapeurs"
      >{{ editMode ? 'Enregistrer' : 'Ajouter' }}</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from 'vuex';

export default {
  name: 'ModalPresence',
  props: {
    data: {
      type: Object,
    },
    callback: {
      type: Function,
    },
  },
  data() {
    return {
      editMode: false,
      date_debut: null,
      date_fin: null,
      heure_debut: null,
      heure_fin: null,
      errors: {},
      selectedSapeurs: {},
      piquet: false,
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste.filter((s) => s.actif),
    }),
    heureDebut() {
      return null; //this.activeInterventionData.heure_debut
    },
    heureFin() {
      return null; //this.activeInterventionData.heure_fin
    },
    dateDebutMin() {
      return this.data.min.slice(0, 10);
    },
    dateDebutMax() {
      return this.data.max.slice(0, 10);
    },
    dateFinMin() {
      return null;
      // if (!this.currentExerciceComptableId) return
      // return (
      //   this.activeInterventionData.date_debut ||
      //   this.exerciceComptableDebut(
      //     this.activeInterventionData.exercice_comptable_id
      //   )
      // )
    },
    dateFinMax() {
      return this.data.max.slice(0, 10);
    },
    nbSelectedSapeurs() {
      return Object.keys(this.selectedSapeurs).filter(
        (s) => this.selectedSapeurs[s]
      ).length;
    },
  },
  mounted() {
    this.editMode = this.data.mode === 'edit';

    if (this.editMode) {
      this.data.sapeurs.forEach(
        (s) => (this.selectedSapeurs = { ...this.selectedSapeurs, [s]: true })
      );
      this.piquet = this.data.presence.piquet;
      this.date_debut = this.data.presence.debut.slice(0, 10);
      this.date_fin = this.data.presence.fin.slice(0, 10);
      this.heure_debut = this.data.presence.debut.slice(11, 16);
      this.heure_fin = this.data.presence.fin.slice(11, 16);
    } else {
      this.date_debut = this.dateDebutMin;
      this.date_fin = this.dateDebutMin;
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
    roundFin() {
      if (this.heure_fin) {
        this.heure_fin = this.roundTime(this.heure_fin, 15);
      }
    },
    roundDebut() {
      if (this.heure_debut) {
        this.heure_debut = this.roundTime(this.heure_debut, 15);
      }
    },
    async save() {
      let debut = this.date_debut + ' ' + this.heure_debut;
      let fin = this.date_fin + ' ' + this.heure_fin;
      if (this.editMode) {
        let presence = {
          ...this.data.presence,
          debut,
          fin,
          piquet: this.piquet,
        };
        this.$store
          .dispatch('editPresence', presence)
          .then(() => {
            this.callback();
            this.HIDE_MODAL();
          })
          .catch((error) => {
            let debut = error['sapeurs.0.debut'];
            let fin = error['sapeurs.0.fin'];
            this.errors = {
              ...error,
              date_debut: debut,
              date_fin: fin,
              heure_debut: debut,
              heure_fin: fin,
            };
          });
      } else {
        let presences = [];
        Object.keys(this.selectedSapeurs)
          .filter((s) => this.selectedSapeurs[s])
          .forEach((s) => {
            presences = [
              ...presences,
              { sapeur_id: s, debut, fin, piquet: this.piquet },
            ];
          });
        this.$store
          .dispatch('addPresences', presences)
          .then(() => {
            this.callback();
            this.HIDE_MODAL();
          })
          .catch((error) => {
            let debut = error['sapeurs.0.debut'];
            let fin = error['sapeurs.0.fin'];
            this.errors = {
              ...error,
              date_debut: debut,
              date_fin: fin,
              heure_debut: debut,
              heure_fin: fin,
            };
          });
      }
    },
    formatSapeur(sapeur) {
      if (!sapeur) return '';
      return sapeur.nom + ' ' + sapeur.prenom;
    },
  },
};
</script>

<style scoped></style>
