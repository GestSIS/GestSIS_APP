<script setup>
import { ref } from "vue";
import { useVehiculeStore } from "../../stores/intervention/Vehicule.js";
import { useMaterielStore } from "../../stores/intervention/Materiel.js";
import { useMissionStore } from "../../stores/intervention/Mission.js";
import { useStatFederalStore } from "../../stores/intervention/StatFederal.js";
import { useStatInterventionStore } from "../../stores/intervention/StatIntervention.js";
import { useTypeInterventionStore } from "../../stores/intervention/TypeIntervention.js";
import { useInterventionTraitementStore } from "../../stores/intervention/InterventionTraitement.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTelephoneStore } from "../../stores/sapeur/Telephone.js";
import ParametreMission from "./ParametreMission.vue";
import ParametreTelephone from "./ParametreTelephone.vue";
import ParametreMateriel from "./ParametreMateriel.vue";
import ParametreVehicule from "./ParametreVehicule.vue";
import ParametreTraitement from "./ParametreTraitement.vue";
import ParametreTypeIntervention from "./ParametreTypeIntervention.vue";
import ParametreStatFederal from "./ParametreStatFederal.vue";

const vehiculeStore = useVehiculeStore();
const materielStore = useMaterielStore();
const missionStore = useMissionStore();
const statFederalStore = useStatFederalStore();
const statInterventionStore = useStatInterventionStore();
const typeInterventionStore = useTypeInterventionStore();
const traitementStore = useInterventionTraitementStore();
const uniteStore = useUniteStore();
const telephoneStore = useTelephoneStore();

const loadVehicule = vehiculeStore.fetchVehicules();
const loadMateriel = materielStore.fetchMateriels();
const loadMission = missionStore.fetchMissions();
const loadAppel = telephoneStore.fetchTelephones();
const loadStatFederal = statFederalStore.fetchStatFederals();
const loadStatIntervention = statInterventionStore.fetchStatInterventions();
const loadTypeIntervention = typeInterventionStore.fetchTypeInterventions();
const loadTraitement = traitementStore.fetchTraitements();
const loadUnite = uniteStore.fetchUnites();

await Promise.all([
  loadVehicule,
  loadMateriel,
  loadMission,
  loadAppel,
  loadStatFederal,
  loadStatIntervention,
  loadTypeIntervention,
  loadTraitement,
  loadUnite,
]);
const tab = ref("vehicule");
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres interventions</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <a
            class="nav-link"
            :class="{ active: tab === 'vehicule' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'vehicule'"
            >Véhicules</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'materiel' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'materiel'"
            >Matériel</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'mission' }"
            href="#"
            @click.prevent="tab = 'mission'"
            >Missions</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'telephone' }"
            href="#"
            @click.prevent="tab = 'telephone'"
            >Téléphones</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'traitement' }"
            href="#"
            @click.prevent="tab = 'traitement'"
            >Traitement</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            @click.prevent="tab = 'type'"
            >Type d'intervention</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'stat' }"
            href="#"
            @click.prevent="tab = 'stat'"
            >Statistique fédérale</a
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-materiel v-if="tab === 'materiel'" />
      <parametre-vehicule v-if="tab === 'vehicule'" />
      <parametre-mission v-if="tab === 'mission'" />
      <parametre-telephone v-if="tab === 'telephone'" />
      <parametre-traitement v-if="tab === 'traitement'" />
      <parametre-type-intervention v-if="tab === 'type'" />
      <parametre-stat-federal v-if="tab === 'stat'" />
    </div>
  </div>
</template>
