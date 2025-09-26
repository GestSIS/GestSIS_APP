<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

await Promise.all([
  store.dispatch('fetchListeSapeur'),
  store.dispatch('fetchLocalites'),
  store.dispatch('fetchStatFederals'),
  store.dispatch('fetchTypeInterventions'),
  store.dispatch('fetchInterventionTraitements'),
]);

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const errors = ref({});
const newMode = ref(false);
const form = ref({});

watchEffect(async () => {
  newMode.value = id === 'new';
  if (!newMode.value) {
    await store.dispatch('fetchIntervention', id);
    form.value = { ...store.state.intervention.active.data };
    form.value.heure_debut = form.value.heure_debut.slice(0, 5);
    form.value.heure_fin = form.value.heure_fin.slice(0, 5);
  } else {
    form.value = {
      stat_nb: 1,
      exercice_comptable_id: store.state.exerciceComptable.activeId,
      sauve_animaux: 0,
      sauve_personne: 0,
    };
  }
});

const localites = computed(() => store.state.localite.liste);
const typesIntervention = computed(() => store.state.typeIntervention.liste);
const statsFederales = computed(() => store.state.statFederal.liste);
const interventionTraitements = computed(
  () => store.state.interventionTraitement.liste
);
const sapeurs = computed(() => store.state.sapeur.liste);

const activeExerciceComptable = computed(() =>
  store.state.exerciceComptable.liste.find(
    (e) => e.id === store.state.exerciceComptable.activeId
  )
);
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION
);
const isValidWgs84 = computed(() => {
  const regex = /^-?\d+\.*\d*,\s*-?\d+\.*\d*$/;
  return regex.test(form.value?.wgs84);
});
const dateDebutMin = computed(() => {
  return activeExerciceComptable.value?.debut;
});
const dateDebutMax = computed(() => {
  return activeExerciceComptable.value?.fin;
});
const dateFinMin = computed(() => {
  return form.value.date_debut || activeExerciceComptable.value?.debut;
});
const dateFinMax = computed(() => {
  return activeExerciceComptable.value?.fin;
});

const awn = inject('awn');
const save = () => {
  if (newMode.value) {
    store
      .dispatch('createIntervention', form.value)
      .then((data) => {
        router.push('/interventions/' + data.id);
        errors.value = {};
      })
      .catch((err) => {
        errors.value = err;
        awn.alert(err?.message || "Erreur lors de l'enregistrement");
      });
  } else {
    store
      .dispatch('saveActiveIntervention', form.value)
      .then((res) => {
        errors.value = {};
        awn.success(res?.message || 'Modifications enregistrées');
      })
      .catch((err) => {
        errors.value = err;
        awn.alert(err?.message || "Erreur lors de l'enregistrement");
      });
  }
};

const degre = [
  { id: 1, type: 'Fausse-alarme' },
  { id: 2, type: 'Petite' },
  { id: 3, type: 'Moyenne' },
  { id: 4, type: 'Grande' },
];
</script>

<template>
  <form class="row" @submit.prevent="save">
    <div class="col-12">
      <div class="row mb-2">
        <div class="col-auto me-auto"></div>
        <div class="col-auto">
          <button
            v-if="hasEditPermission"
            type="submit"
            class="btn btn-primary"
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
                    required
                    id="m-int-date-debut"
                    v-model="form.date_debut"
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
                    required
                    id="m-int-heure_debut"
                    v-model="form.heure_debut"
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
                    required
                    id="m-int-date-fin"
                    v-model="form.date_fin"
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
                    required
                    id="m-int-heure_fin"
                    v-model="form.heure_fin"
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
              v-model="form.objet"
              type="text"
              required
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
              v-model="form.lieu"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['lieu'] }"
              name="lieu"
            />
          </div>
          <!-- NPA + LOCALITE -->
          <base-select
            v-model="form.localite_id"
            label="Localité"
            :options="localites"
            :disabled="!hasEditPermission"
            required
            :select-class="{ 'is-invalid': errors['localite_id'] }"
            class="mb-3"
          />
          <!-- Chef d'intervention -->
          <base-select
            v-model="form.sapeur_id"
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
                v-model="form.wgs84"
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
                :href="'https://www.google.com/maps/place/' + form.wgs84"
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
                  v-model="form.rapport_police"
                  type="checkbox"
                  :disabled="!hasEditPermission"
                  class="form-check-input"
                />
              </div>
              <input
                v-if="form.rapport_police"
                id="m-int-agent"
                v-model="form.agent"
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
            v-model="form.intervention_traitement_id"
            class="mb-3"
            :class="{
              'is-invalid': errors['intervention_traitement_id'],
            }"
            label="Traitement"
            :required="true"
            :options="interventionTraitements"
            :disabled="!hasEditPermission"
          />
          <div class="row mb-3">
            <base-select
              v-model="form.type_intervention_id"
              class="col-8"
              :class="{ 'is-invalid': errors['type_intervention_id'] }"
              label="Type d'intervention"
              :options="typesIntervention"
              :disabled="!hasEditPermission"
              :required="true"
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
                v-model="form.stat_nb"
                type="number"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': false }"
                name="suffixe"
                required
              />
            </div>
          </div>
          <base-select
            v-model="form.stat_federal_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['stat_federal_id'] }"
            label="Statistique fédérale"
            :options="statsFederales"
            :disabled="!hasEditPermission"
            :required="true"
          />
          <!-- Sauve personnes -->
          <div class="mb-3">
            <label for="m-int-save-pers">Nb de personnes sauvées</label>
            <input
              id="m-int-save-pers"
              v-model="form.sauve_personne"
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
              v-model="form.sauve_animaux"
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
            v-model="form.degre"
            class="mb-3"
            :class="{
              'is-invalid': errors['degre'],
            }"
            label="Traitement"
            display-key="type"
            :required="true"
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
                  v-model="form.proprietaire"
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
                  v-model="form.responsable"
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
  </form>
</template>
