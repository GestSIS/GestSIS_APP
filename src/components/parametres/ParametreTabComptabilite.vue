<script setup>
import { useUniteStore } from "../../stores/common/Unite.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useAvsParamStore } from "../../stores/comptabilite/AvsParam.js";
import { useHeureExerciceStore } from "../../stores/exercice/HeureExercice.js";
import { usePhaseTypeStore } from "../../stores/intervention/PhaseType.js";
import { useAmendeStore } from "../../stores/comptabilite/Amende.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";

const uniteStore = useUniteStore();
const fonctionStore = useFonctionStore();
const avsParamStore = useAvsParamStore();
const heureExerciceStore = useHeureExerciceStore();
const phaseTypeStore = usePhaseTypeStore();
const amendeStore = useAmendeStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();

const loadAmendes = amendeStore.fetchAmendes();
const loadFraisIndemnites = imputationStore.fetchFraisIndemnitesTypes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();
const loadCategories = ecritureCategorieStore.fetchEcritureCategories();
const loadAvsParams = avsParamStore.fetchParams();
const loadPhases = phaseTypeStore.fetchPhaseTypes();
const loadHeures = heureExerciceStore.fetchHeuresExercice();

await Promise.all([
  loadAmendes,
  loadFraisIndemnites,
  loadFonctions,
  loadComptes,
  loadUnites,
  loadCategories,
  loadAvsParams,
  loadPhases,
  loadHeures,
]);
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres comptabilité</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-comptabilite-compte' }"
            >Compte</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-comptabilite-categorie' }"
            >Catégories comptables</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-indemnite-exercice' }"
            >Imputation exercice &amp; séance</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-indemnite-intervention' }"
            >Imputation intervention</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-indemnite-cours' }"
            >Imputation cours</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-heure-exercice' }"
            >Heures additionnelles pour exercice</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-comptabilite-indemnite-frais-annuel' }"
            >Frais &amp; indemnité annuel</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-cotisations' }"
            >Côtisations sociales</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            :to="{ name: 'param-comptabilite-amende' }"
            >Amende</router-link
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <router-view />
    </div>
  </div>
</template>
