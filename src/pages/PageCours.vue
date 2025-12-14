<script setup>
import { useSapeurStore } from '../stores/sapeur/Sapeur.js';
import { useCoursStore } from '../stores/sapeur/Cours.js';
import { useCoursSapeurStore } from '../stores/sapeur/CoursSapeur.js';
import { useLocaliteStore } from '../stores/common/Localite.js';
import { useExerciceComptableStore } from '../stores/comptabilite/ExerciceComptable.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { computed, ref, watchEffect } from 'vue';

const sapeurStore = useSapeurStore();
const coursStore = useCoursStore();
const coursSapeurStore = useCoursSapeurStore();
const localiteStore = useLocaliteStore();
const exerciceComptableStore = useExerciceComptableStore();

const loadLocalities = localiteStore.fetchLocalites();
const loadCours = coursStore.fetchCours();
const loadSapeurs = sapeurStore.fetchListeSapeur();

await exerciceComptableStore.fetchExercicesComptables();

const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await coursSapeurStore.fetchCoursSapeurs(activeExerciceComptableId.value);
  loading.value = false;
});

await Promise.all([loadLocalities, loadCours, loadSapeurs]);

const sapeurs = computed(() =>
  sapeurStore.liste.sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom)),
);
const coursTypes = computed(() =>
  coursStore.liste.sort((a, b) => a.designation.localeCompare(b.designation)),
);
const coursSapeurs = computed(() =>
  coursSapeurStore.liste.sort((a, b) => a.date.localeCompare(b.date)),
);
const localites = computed(() =>
  localiteStore.liste.sort((a, b) =>
    a.designation.localeCompare(b.designation),
  ),
);

const computedData = computed(() =>
  coursSapeurs.value.map((s) => ({
    ...s,
    localite: localites.value.find((l) => l.id == s.localite_id)?.designation,
    designation: coursTypes.value.find((l) => l.id == s.cours_id)?.designation,
    nom_prenom: sapeurs.value.find((l) => l.id == s.sapeur_id)?.nom_prenom,
  })),
);
const filteredSapeurs = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => parseInt(i.sapeur_id)));
  return sapeurs.value.filter((t) => ids.has(t.id));
});
const filteredCoursTypes = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => parseInt(i.cours_id)));
  return coursTypes.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => parseInt(i.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Cours', key: 'designation' },
  { title: 'Sapeur', key: 'nom_prenom' },
  { title: 'Durée [jour]', key: 'duree' },
  { title: 'Localité', key: 'localite' },
];
</script>

<template>
  <stateful-filter
    id="cours"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Cours</li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="col-md-4 mb-1"
                  base-option="<Cours>"
                  :options="filteredCoursTypes"
                  :model-value="filters.cours_id"
                  @update:model-value="(value) => setFilter('cours_id', value)"
                />
                <base-select
                  class="col-md-4 mb-1"
                  display-key="nom_prenom"
                  base-option="<Sapeur>"
                  :options="filteredSapeurs"
                  :model-value="filters.sapeur_id"
                  @update:model-value="(value) => setFilter('sapeur_id', value)"
                />
                <base-select
                  class="col-md-4 mb-1"
                  base-option="<Localité>"
                  :options="filteredLocalites"
                  :model-value="filters.localite_id"
                  @update:model-value="
                    (value) => setFilter('localite_id', value)
                  "
                />
                <div v-if="canReset" class="col-md-4 mb-1">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-3">
            <div class="card-body table-responsive p-0">
              <base-table
                :loading="loading"
                :selectable="true"
                :fields="fields"
                no-data="Aucun cours à afficher"
                :data="filteredData"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
