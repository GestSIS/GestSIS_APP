<template>
  <div class="row">
    <div class="col-12">
      <div class="row mb-2">
        <div class="col-auto me-auto"></div>
        <div class="col-auto">
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="save"
          >
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
              <div class="mb-3">
                <label for="m-int-date-debut">Date de début</label>
                <div class="input-group input-group-sm">
                  <div class="input-group-text">
                    <font-awesome-icon :icon="['far', 'calendar-alt']" />
                  </div>
                  <input
                    id="m-int-date-debut"
                    v-model="activeInterventionData.date_debut"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['date_debut'] }"
                    type="date"
                    :readonly="!hasEditPermission"
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
                    v-model="activeInterventionData.heure_debut"
                    type="time"
                    :readonly="!hasEditPermission"
                    class="form-control form-control-sm"
                    :class="{
                      'is-invalid': errors['heure_debut'],
                    }"
                    name="heure_debut"
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
                    v-model="activeInterventionData.date_fin"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['date_fin'] }"
                    :min="dateFinMin"
                    :max="dateFinMax"
                    type="date"
                    :readonly="!hasEditPermission"
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
                    v-model="activeInterventionData.heure_fin"
                    type="time"
                    :readonly="!hasEditPermission"
                    class="form-control form-control-sm"
                    :class="{
                      'is-invalid': errors['heure_fin'],
                    }"
                    name="heure_fin"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- OBJET -->
          <div class="mb-3">
            <label for="m-int-objet">Objet</label>
            <input
              id="m-int-objet"
              v-model="activeInterventionData.objet"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['objet'] }"
              name="objet"
            />
          </div>

          <!-- LIEU -->
          <div class="mb-3">
            <label for="m-int-lieu">Lieu (Rue, N°)</label>
            <input
              id="m-int-lieu"
              v-model="activeInterventionData.lieu"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['lieu'] }"
              name="lieu"
            />
          </div>
          <!-- NPA + LOCALITE -->
          <base-select
            v-model="activeInterventionData.localite_id"
            label="Localité"
            :options="localites"
            :disabled="!hasEditPermission"
            required
            :select-class="{ 'is-invalid': errors['localite_id'] }"
            class="mb-3"
          />
          <!-- Chef d'intervention -->
          <base-select
            v-model="activeInterventionData.sapeur_id"
            label="Chef d'intervention"
            :options="sapeurs"
            :disabled="!hasEditPermission"
            display-key="nom_prenom"
            required
            :select-class="{ 'is-invalid': errors['sapeur_id'] }"
            class="mb-3"
          />
          <!-- Coordonées -->
          <div class="mb-3">
            <label for="m-int-wgs84">Coordonées (format wgs84)</label>
            <div class="input-group input-group-sm">
              <input
                id="m-int-wgs84"
                v-model="activeInterventionData.wgs84"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['wgs84'] }"
                name="wgs84"
              />
              <button
                v-if="!isValidWgs84"
                id="button-addon2"
                class="btn btn-outline-secondary"
                type="button"
                disabled
              >
                GPS
              </button>
              <a
                v-else
                id="button-gps"
                class="btn btn-outline-secondary"
                target="_blank"
                rel="noopener noreferrer"
                :href="
                  'https://www.google.com/maps/place/' +
                  activeInterventionData.wgs84
                "
                >GPS</a
              >
            </div>
          </div>
          <!-- Rapport police -->
          <div class="mb-3 row">
            <label for="m-sap-cotisation_avs">Rapport police</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <input
                  id="m-sap-cotisation_avs"
                  v-model="activeInterventionData.rapport_police"
                  type="checkbox"
                  :disabled="!hasEditPermission"
                  class="form-check-input"
                />
              </div>
              <input
                v-if="activeInterventionData.rapport_police"
                id="m-int-agent"
                v-model="activeInterventionData.agent"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['agent'] }"
                name="agent"
              />
            </div>
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
          <base-select
            v-model="activeInterventionData.intervention_traitement_id"
            class="mb-3"
            :class="{
              'is-invalid': errors['intervention_traitement_id'],
            }"
            label="Traitement"
            :options="interventionTraitements"
            :disabled="!hasEditPermission"
          />
          <div class="row mb-3">
            <base-select
              v-model="activeInterventionData.type_intervention_id"
              class="col-8"
              :class="{ 'is-invalid': errors['type_intervention_id'] }"
              label="Type d'intervention"
              :options="typesIntervention"
              :disabled="!hasEditPermission"
            />
            <div class="col-4">
              <label for="m-sap-suffixe">Nb intervention</label>
              <font-awesome-icon
                v-tooltip.bottom="{
                  content:
                    'Permet de créer un unique rapport d\'intervention pour plusieurs interventions,<br /> tout en ayant des statistiques d\'interventions correctes.',
                  html: true,
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <input
                id="m-sap-suffixe"
                v-model="activeInterventionData.stat_nb"
                type="number"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': false }"
                name="suffixe"
              />
            </div>
          </div>
          <base-select
            v-model="activeInterventionData.stat_federal_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['stat_federal_id'] }"
            label="Statistique fédérale"
            :options="statsFederales"
            :disabled="!hasEditPermission"
          />
          <!-- Sauve personnes -->
          <div class="mb-3">
            <label for="m-int-save-pers">Nb de personnes sauvées</label>
            <input
              id="m-int-save-pers"
              v-model="activeInterventionData.sauve_personne"
              type="number"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['sauve_personne'] }"
              name="sauve_personne"
              min="0"
            />
          </div>
          <!-- Sauve animaux -->
          <div class="mb-3">
            <label for="m-int-save-ani">Nb d'animaux sauvés</label>
            <input
              id="m-int-save-ani"
              v-model="activeInterventionData.sauve_animaux"
              type="number"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['sauve_animaux'] }"
              name="sauve_animaux"
              min="0"
            />
          </div>

          <!-- DEGRE -->
          <base-select
            v-model="activeInterventionData.degre"
            class="mb-3"
            :class="{
              'is-invalid': errors['degre'],
            }"
            label="Traitement"
            display-key="type"
            :options="degre"
            :disabled="!hasEditPermission"
          />
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
              <div class="mb-3">
                <label for="m-int-save-ani">Propriétaire</label>
                <textarea
                  id="m-int-proprietaire"
                  v-model="activeInterventionData.proprietaire"
                  type="text"
                  :readonly="!hasEditPermission"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['proprietaire'] }"
                  name="proprietaire"
                  rows="5"
                ></textarea>
              </div>
              <!-- Responsable -->
              <div class="mb-3">
                <label for="m-int-save-ani">Responsable</label>
                <textarea
                  id="m-int-responsable"
                  v-model="activeInterventionData.responsable"
                  type="text"
                  :readonly="!hasEditPermission"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['responsable'] }"
                  name="responsable"
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
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';
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
      localites: (state) => state.localite.liste,
      typesIntervention: (state) => state.typeIntervention.liste,
      statsFederales: (state) => state.statFederal.liste,
      interventionTraitements: (state) => state.interventionTraitement.liste,
      sapeurs: (state) => state.sapeur.liste,
      activeInterventionId: (state) => state.intervention.active.id,
      activeInterventionData: (state) => state.intervention.active.data,
      activeExerciceComptable: (state) =>
        state.exerciceComptable.liste.find(
          (e) => e.id === state.exerciceComptable.activeId
        ),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
    isValidWgs84() {
      const regex = /^-?\d+\.*\d*,\s*-?\d+\.*\d*$/;
      return regex.test(this.activeInterventionData?.wgs84);
    },
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
      return this.activeExerciceComptable?.debut;
    },
    dateDebutMax() {
      return this.activeExerciceComptable?.fin;
    },
    dateFinMin() {
      return (
        this.activeInterventionData.date_debut ||
        this.activeExerciceComptable?.debut
      );
    },
    dateFinMax() {
      return this.activeExerciceComptable?.fin;
    },
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
  methods: {
    async save() {
      if (this.newMode) {
        this.$store
          .dispatch('createIntervention', this.activeInterventionData)
          .then((data) => {
            this.$router.push('/interventions/' + data.id);
            this.errors = {};
          })
          .catch((err) => {
            this.errors = err;
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement");
          });
      } else {
        this.$store
          .dispatch('saveActiveIntervention', this.activeInterventionData)
          .then((res) => {
            this.errors = {};
            this.$awn.success(res?.message || 'Modifications enregistrées');
          })
          .catch((err) => {
            this.errors = err;
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement");
          });
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
