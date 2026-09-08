<script setup>
import { useVehiculeStore } from "../../stores/intervention/Vehicule.js";
import { useMaterielStore } from "../../stores/intervention/Materiel.js";
import { useMissionStore } from "../../stores/intervention/Mission.js";
import { useStatFederalStore } from "../../stores/intervention/StatFederal.js";
import { useStatInterventionStore } from "../../stores/intervention/StatIntervention.js";
import { useTypeInterventionStore } from "../../stores/intervention/TypeIntervention.js";
import { useInterventionTraitementStore } from "../../stores/intervention/InterventionTraitement.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTelephoneStore } from "../../stores/sapeur/Telephone.js";

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
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres interventions</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-intervention-vehicule' }"
            >Véhicules</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-intervention-materiel' }"
            >Matériel</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-intervention-mission' }"
            >Missions</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-intervention-telephone' }"
            >Téléphones</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-intervention-traitement' }"
            >Traitement</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-intervention-type' }"
            >Type d'intervention</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-intervention-stat' }"
            >Statistique fédérale</router-link
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <router-view />
    </div>
  </div>
</template>
