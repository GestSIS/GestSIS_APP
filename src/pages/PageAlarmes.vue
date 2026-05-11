<script setup>
import { useModalStore } from '../stores/common/Modal';
import permissions from '../composables/permissions.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { computed, ref, watch, watchEffect } from 'vue';
import useHasPermission from '../composables/usePermission.js';
import { useSapeurStore } from '../stores/sapeur/Sapeur.js';
import { useLocaliteStore } from '../stores/common/Localite.js';
import { useExerciceComptableStore } from '../stores/comptabilite/ExerciceComptable.js';
import { useInterventionStore } from '../stores/intervention/Intervention.js';
import { useInterventionTraitementStore } from '../stores/intervention/InterventionTraitement.js';
import { useStatFederalStore } from '../stores/intervention/StatFederal.js';
import { useTypeInterventionStore } from '../stores/intervention/TypeIntervention.js';
import { useAlarmeStore } from '../stores/alarme/Alarme';

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const exerciceComptableStore = useExerciceComptableStore();
const alarmeStore = useAlarmeStore();
const traitementStore = useInterventionTraitementStore();
const statFederalStore = useStatFederalStore();
const typeInterventionStore = useTypeInterventionStore();

const loadSapeurs = sapeurStore.fetchListeSapeur();
const loadLocalities = localiteStore.fetchLocalites();
const loadStatFederal = statFederalStore.fetchStatFederals();
const loadTypeInterventions = typeInterventionStore.fetchTypeInterventions();
const loadInterventionTraitement = traitementStore.fetchTraitements();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await alarmeStore.fetchListeAlarme();
  loading.value = false;
});

await Promise.all([
  loadSapeurs,
  loadLocalities,
  loadStatFederal,
  loadTypeInterventions,
  loadInterventionTraitement,
]);

const alarmes = computed(
  () => alarmeStore.liste, //.sort((a, b) => b.date_debut.localeCompare(a.date_debut)),
);
const types = computed(() => typeInterventionStore.liste);
const stats = computed(() => statFederalStore.liste);
const traitements = computed(() => traitementStore.liste);
const localites = computed(() =>
  localiteStore.liste.sort((a, b) =>
    a.designation.localeCompare(b.designation),
  ),
);

const computedData = computed(() => {
  return alarmes.value;
  // return interventions.value.map((e) => ({
  //   ...e,
  //   type_intervention: types.value.find((c) => c.id == e.type_intervention_id)
  //     ?.designation,
  //   localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
  //   stat_federal: stats.value.find((l) => l.id == e.stat_federal_id)
  //     ?.designation,
  //   traitement: traitements.value.find(
  //     (l) => l.id == e.intervention_traitement_id,
  //   )?.designation,
  // }));
});

const fields = [
  { title: 'Date', key: 'date_debut', type: Date },
  {
    title: 'Heure',
    key: 'heure_debut',
    formatter: (value) => value.slice(0, 5),
  },
  { title: "Type d'intervention", key: 'type_intervention' },
  { title: 'Localité', key: 'localite' },
  { title: 'Lieu', key: 'lieu', columnClass: 'align-middle' },
  { title: 'Stat fédérale', key: 'stat_federal' },
  { title: 'Traitement', key: 'traitement' },
  {
    title: 'Étendue',
    key: 'degre',
    formatter: (value) => {
      const degre = {
        1: 'Fausse-alarme',
        2: 'Petite',
        3: 'Moyenne',
        4: 'Grande',
      };
      return degre[value];
    },
  },
  {
    title: 'Statut',
    key: 'statut',
    formatter: (value) => {
      const statuts = {
        0: 'A saisir',
        1: 'A valider',
        2: 'Validée',
        3: 'Imputée',
      };
      return statuts[value];
    },
  },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="interventions"
    v-slot="{ filteredData }"
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
              <li class="breadcrumb-item active" aria-current="page">
                Alarmes
              </li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-3">
            <div class="card-body table-responsive p-0">
              <base-table
                :loading="loading"
                :fields="fields"
                no-data="Aucune alarme à afficher"
                :data="filteredData ?? []"
                :selectable="true"
                @selected="select"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
