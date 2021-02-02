<template>
  <div class="row">
    <div class="col-12">
      <div class="row mb-2">
        <div class="col-auto mr-auto"></div>
        <div class="col-auto">
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
    <div class="col-sm-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-6 col-xl-6">
              <div class="form-group">
                <label for="m-int-date-debut">Date de début</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                  </div>
                  <input
                    class="form-control"
                    :class="{ 'is-invalid': errors['date_debut'] }"
                    type="date"
                    :min="dateDebutMin"
                    :max="dateDebutMax"
                    id="m-int-date-debut"
                    name="date_debut"
                    v-model="activeInterventionData.date_debut"
                  />
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-6">
              <div class="form-group">
                <label for="m-int-heure_debut">Heure</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'clock']" />
                    </div>
                  </div>
                  <input
                    type="time"
                    class="form-control"
                    :class="{ 'is-invalid': errors['heure_debut'] }"
                    id="m-int-heure_debut"
                    name="heure_debut"
                    v-model="activeInterventionData.heure_debut"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6 col-xl-6">
              <div class="form-group">
                <label for="m-int-date-fin">Date de fin</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                  </div>
                  <input
                    class="form-control"
                    :class="{ 'is-invalid': errors['date_fin'] }"
                    :min="dateFinMin"
                    :max="dateFinMax"
                    type="date"
                    id="m-int-date-fin"
                    name="date_fin"
                    v-model="activeInterventionData.date_fin"
                  />
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-6">
              <div class="form-group">
                <label for="m-int-heure_fin">Heure</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'clock']" />
                    </div>
                  </div>
                  <input
                    type="time"
                    class="form-control"
                    :class="{
                      'is-invalid': errors['heure_fin'],
                    }"
                    id="m-int-heure_fin"
                    name="heure_fin"
                    v-model="activeInterventionData.heure_fin"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- OBJET -->
          <div class="form-group">
            <label for="m-int-objet">Objet</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors['objet'] }"
              id="m-int-objet"
              name="objet"
              v-model="activeInterventionData.objet"
            />
          </div>

          <!-- LIEU -->
          <div class="form-group">
            <label for="m-int-lieu">Lieu (Rue, N°)</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors['lieu'] }"
              id="m-int-lieu"
              name="lieu"
              v-model="activeInterventionData.lieu"
            />
          </div>
          <!-- NPA + LOCALITE -->
          <div class="form-group">
            <label for="m-int-localite">Localité</label>
            <select
              class="custom-select required"
              :class="{ 'is-invalid': errors['localite_id'] }"
              id="m-int-localite"
              name="localite_id"
              style="width: 100%"
              v-model="activeInterventionData.localite_id"
            >
              <option
                v-for="localite in listLocalitesSis"
                :key="localite.id"
                :value="localite.id"
              >
                {{ localite.npa + ' ' + localite.designation }}
              </option>
            </select>
          </div>
          <!-- Chef d'intervention -->
          <div class="form-group">
            <label for="m-int-sapeur">Chef d'intervention</label>
            <select
              class="custom-select required"
              :class="{ 'is-invalid': errors['sapeur_id'] }"
              id="m-int-sapeur"
              name="localite_id"
              style="width: 100%"
              v-model="activeInterventionData.sapeur_id"
            >
              <option
                v-for="sapeur in listSapeur"
                :key="sapeur.id"
                :value="sapeur.id"
              >
                {{ sapeur.nom + ' ' + sapeur.prenom }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-sm-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Statistiques</h3>
        </div>
        <div class="card-body">
          <!-- INTERVENTION TRAITEMENT -->
          <div class="form-group">
            <label for="m-int-traitement">Traitement</label>
            <select
              class="custom-select required"
              :class="{
                'is-invalid': errors['intervention_traitement_id'],
              }"
              id="m-int-traitement"
              name="localite_id"
              style="width: 100%"
              v-model="activeInterventionData.intervention_traitement_id"
            >
              <option
                v-for="traitement in listInterventionTraitement"
                :key="traitement.id"
                :value="traitement.id"
              >
                {{ traitement.designation }}
              </option>
            </select>
          </div>
          <!-- TYPE D'INTERVENTION -->
          <div class="form-group">
            <label for="m-int-type">Type d'intervention</label>
            <select
              class="custom-select"
              :class="{ 'is-invalid': errors['type_intervention_id'] }"
              id="m-int-type"
              name="type_intervention_id"
              v-model="activeInterventionData.type_intervention_id"
            >
              <option
                v-for="type in listTypeIntervention"
                :value="type.id"
                :key="type.id"
              >
                {{ type.designation }}
              </option>
            </select>
          </div>
          <!-- STAT FEDERAL -->
          <div class="form-group">
            <label for="m-int-stat">Statistique fédérale</label>
            <select
              class="custom-select required"
              :class="{ 'is-invalid': errors['stat_federal_id'] }"
              id="m-int-stat"
              name="stat"
              style="width: 100%"
              v-model="activeInterventionData.stat_federal_id"
            >
              <option
                v-for="stat in listStatFederal"
                :key="stat.id"
                :value="stat.id"
              >
                {{ stat.designation }}
              </option>
            </select>
          </div>

          <!-- Sauve personnes -->
          <div class="form-group">
            <label for="m-int-save-pers">Nb de personnes sauvées</label>
            <input
              type="number"
              class="form-control"
              :class="{ 'is-invalid': errors['sauve_personne'] }"
              id="m-int-save-pers"
              name="sauve_personne"
              min="0"
              v-model="activeInterventionData.sauve_personne"
            />
          </div>
          <!-- Sauve animaux -->
          <div class="form-group">
            <label for="m-int-save-ani">Nb d'animaux sauvés</label>
            <input
              type="number"
              class="form-control"
              :class="{ 'is-invalid': errors['sauve_animaux'] }"
              id="m-int-save-ani"
              name="sauve_animaux"
              min="0"
              v-model="activeInterventionData.sauve_animaux"
            />
          </div>

          <!-- DEGRE -->
          <div class="form-group">
            <label for="m-int-degre">Degre</label>
            <select
              class="custom-select required"
              :class="{
                'is-invalid': errors['degre'],
              }"
              id="m-int-degre"
              name="degre"
              style="width: 100%"
              v-model="activeInterventionData.degre"
            >
              <option v-for="deg in degre" :key="deg.id" :value="deg.id">
                {{ deg.type }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Contact</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-12 col-xl-12">
              <!-- Proprio -->
              <div class="form-group">
                <label for="m-int-save-ani">Propriétaire</label>
                <textarea
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors['proprietaire'] }"
                  id="m-int-proprietaire"
                  name="proprietaire"
                  v-model="activeInterventionData.proprietaire"
                  rows="5"
                ></textarea>
              </div>
              <!-- Responsable -->
              <div class="form-group">
                <label for="m-int-save-ani">Responsable</label>
                <textarea
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors['responsable'] }"
                  id="m-int-responsable"
                  name="responsable"
                  v-model="activeInterventionData.responsable"
                  rows="5"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

const degre = [
  { id: 1, type: 'Fausse-alarme' },
  { id: 2, type: 'Petite' },
  { id: 3, type: 'Moyenne' },
  { id: 4, type: 'Grande' },
];

export default {
  name: 'InterventionTabGeneral',
  props: {
    newMode: {
      type: Boolean,
    },
  },
  data() {
    return {
      errors: {},
      degre,
    };
  },
  computed: {
    ...mapState({
      listTypeIntervention: (state) => state.typeIntervention.liste,
      listStatFederal: (state) => state.statFederal.liste,
      listInterventionTraitement: (state) => state.interventionTraitement.liste,
      listSapeur: (state) => state.sapeur.liste,
      activeInterventionId: (state) => state.intervention.active.id,
      activeInterventionData: (state) => state.intervention.active.data,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters([
      'listLocalitesSis',
      'exerciceComptableDebut',
      'exerciceComptableFin',
    ]),
    description() {
      return this.activeInterventionData.description;
    },
    proprietaire() {
      return this.activeInterventionData.proprietaire;
    },
    responsable() {
      return this.activeInterventionData.responsable;
    },
    heureDebut() {
      return this.activeInterventionData.heure_debut;
    },
    heureFin() {
      return this.activeInterventionData.heure_fin;
    },
    dateDebutMin() {
      if (!this.currentExerciceComptableId) return;
      return this.exerciceComptableDebut(
        this.activeInterventionData.exercice_comptable_id
      );
    },
    dateDebutMax() {
      if (!this.currentExerciceComptableId) return;
      return this.exerciceComptableFin(
        this.activeInterventionData.exercice_comptable_id
      );
    },
    dateFinMin() {
      if (!this.currentExerciceComptableId) return;
      return (
        this.activeInterventionData.date_debut ||
        this.exerciceComptableDebut(
          this.activeInterventionData.exercice_comptable_id
        )
      );
    },
    dateFinMax() {
      if (!this.currentExerciceComptableId) return;
      return this.exerciceComptableFin(
        this.activeInterventionData.exercice_comptable_id
      );
    },
  },
  mounted() {
    this.activeInterventionData.responsable = this.replaceBr(
      this.activeInterventionData.responsable
    );
    this.activeInterventionData.description = this.replaceBr(
      this.activeInterventionData.description
    );
    this.activeInterventionData.proprietaire = this.replaceBr(
      this.activeInterventionData.proprietaire
    );
    this.activeInterventionData.heure_debut = this.formatHeure(
      this.activeInterventionData.heure_debut
    );
    this.activeInterventionData.heure_fin = this.formatHeure(
      this.activeInterventionData.heure_fin
    );
  },
  watch: {
    responsable(value) {
      this.activeInterventionData.responsable = this.replaceBr(value);
    },
    description(value) {
      this.activeInterventionData.description = this.replaceBr(value);
    },
    proprietaire(value) {
      this.activeInterventionData.proprietaire = this.replaceBr(value);
    },
    heureDebut(value) {
      this.activeInterventionData.heure_debut = this.formatHeure(value);
    },
    heureFin(value) {
      this.activeInterventionData.heure_fin = this.formatHeure(value);
    },
  },
  methods: {
    save() {
      if (this.newMode) {
        this.$store
          .dispatch('createIntervention', this.activeInterventionData)
          .then((data) => {
            this.$router.push('/interventions/' + data.id);
            this.errors = {};
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('saveActiveIntervention', this.activeInterventionData)
          .then(() => (this.errors = {}))
          .catch((errors) => (this.errors = errors));
      }
    },
    replaceBr(value) {
      if (value) {
        return value.replace('<br />', '\n');
      }
    },
    formatHeure(value) {
      if (value && value.length >= 8) {
        return value.slice(0, 5);
      }
      return value;
    },
  },
};
</script>

<style scoped></style>
