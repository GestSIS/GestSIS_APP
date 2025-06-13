<script setup>
import { useStore } from 'vuex';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { ref, watch } from 'vue';
import { computed } from 'vue';

const store = useStore();

const loadSapeurs = store.dispatch('fetchListeSapeur');
const loadLocalities = store.dispatch('fetchLocalites');
const loadStatFederal = store.dispatch('fetchStatFederals');
const loadTypeInterventions = store.dispatch('fetchTypeInterventions');
const loadInterventionTraitement = store.dispatch(
  'fetchInterventionTraitements',
);

await store.dispatch('fetchExercicesComptables');
const loading = ref(true);

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const newMode = computed(() => id === 'new');
if (newMode.value) {
  store.dispatch('resetActiveIntervention').then(() => (loading.value = false));
} else {
  store.dispatch('selectIntervention', id);
  store.dispatch('fetchIntervention', id).then(() => (loading.value = false));
}

await Promise.all([
  loadSapeurs,
  loadLocalities,
  loadStatFederal,
  loadTypeInterventions,
  loadInterventionTraitement,
]);

const activeInterventionData = computed(
  () => store.state.intervention.active.data,
);

const breadcrumbFinal = computed(() =>
  newMode.value
    ? 'Nouveau'
    : new Date(activeInterventionData.value.date_debut).toLocaleDateString(
        'fr-CH',
      ) +
      ' - ' +
      activeInterventionData.value.objet,
);

watch(
  () => id,
  () => {
    if (newMode.value) {
      store
        .dispatch('resetActiveIntervention')
        .then(() => (loading.value = false));
    } else {
      store.dispatch('selectIntervention', parseInt(id));
      store
        .dispatch('fetchIntervention', parseInt(id))
        .then(() => (loading.value = false));
    }
  },
);
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'interventions' }"
              >Interventions</router-link
            >
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ breadcrumbFinal }}
          </li>
        </ol>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          v-if="!newMode"
          :routes="[
            { to: { name: 'intervention-details' }, texte: 'Informations' },
            { to: { name: 'intervention-resume' }, texte: 'Résume' },
            { to: { name: 'intervention-presence' }, texte: 'Présences' },
            { to: { name: 'intervention-journal' }, texte: 'Journal' },
            {
              to: { name: 'intervention-materiel-vehicule' },
              texte: 'Matériels et Véhicules',
            },
          ]"
        />
        <div id="nav-tabContent" class="tab-content">
          <div
            v-if="!loading"
            class="tab-pane fade show active"
            role="tabpanel"
          >
            <router-view />
          </div>
          <div v-else class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
