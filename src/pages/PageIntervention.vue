<script setup>
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import { watchEffect } from "vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInterventionStore } from "../stores/intervention/Intervention.js";
import { interventionStatut } from "../composables/interventionStatuts.js";
import useValidationIntervention from "../composables/useValidationIntervention.js";

const interventionStore = useInterventionStore();
const route = useRoute();
const router = useRouter();

const { id } = defineProps({
  id: {
    type: String,
    default: "new",
  },
});

const newMode = computed(() => id === "new");
watchEffect(() => {
  if (id !== "new") {
    interventionStore.selectIntervention(id);
  } else {
    if (route.name != "intervention-details") {
      router.push({ name: "intervention-details", id: "new" });
    }
  }
});

const activeInterventionData = computed(() => interventionStore.active.data);

const breadcrumbFinal = computed(() =>
  newMode.value
    ? "Nouveau"
    : new Date(activeInterventionData.value.date_debut).toLocaleDateString("fr-CH") +
      " - " +
      activeInterventionData.value.objet,
);

const { showValiderButton, showDevaliderButton, validerIntervention, devaliderIntervention } =
  useValidationIntervention(id);
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
            <router-link :to="{ name: 'interventions' }">Interventions</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ breadcrumbFinal }}
          </li>
        </ol>
      </div>
      <div class="col-sm-6 d-flex justify-content-end align-items-center gap-2">
        <status-badge v-if="!newMode" :status="interventionStatut(activeInterventionData.statut)" />
        <button
          v-if="!newMode && showValiderButton"
          class="btn btn-sm btn-primary"
          @click="validerIntervention"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="me-1" />
          Valider
        </button>
        <button
          v-if="!newMode && showDevaliderButton"
          class="btn btn-sm btn-outline-warning"
          title="Repasser l'intervention en attente de validation"
          @click="devaliderIntervention"
        >
          <font-awesome-icon :icon="['fas', 'rotate-left']" class="me-1" />
          Annuler la validation
        </button>
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
