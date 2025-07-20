<script setup>
import { useStore } from 'vuex';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { watchEffect } from 'vue';
import { computed } from 'vue';
import router from '../router';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const newMode = computed(() => id === 'new');
watchEffect(() => {
  if (id !== 'new') {
    store.dispatch('selectIntervention', id);
  } else {
    if (route.name != 'intervention-details') {
      router.push({ name: 'intervention-details', id: 'new' });
    }
  }
});

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
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
