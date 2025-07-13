<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';

import ParametreCompte from './ParametreCompte.vue';
import ParametreEcritureCategorie from './ParametreEcritureCategorie.vue';
import ParametreIndemniteFraisAnnuel from './ParametreIndemniteFraisAnnuel.vue';
import ParametreIndemniteExercice from './ParametreIndemniteExercice.vue';
import ParametreIndemniteCours from './ParametreIndemniteCours.vue';
import ParametreHeureExercice from './ParametreHeureExercice.vue';
import ParametreIndemniteIntervention from './ParametreIndemniteIntervention.vue';
import ParametreAvs from './ParametreAvs.vue';
import ParametreAmende from './ParametreAmende.vue';

const store = useStore();
const loadAmendes = store.dispatch('fetchAmendes');
const loadFraisIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
const loadFonctions = store.dispatch('fetchFonctions');
const loadComptes = store.dispatch('fetchComptes');
const loadUnites = store.dispatch('fetchUnites');
const loadCategories = store.dispatch('fetchEcritureCategories');
const loadAvsParams = store.dispatch('fetchAvsParams');
const loadPhases = store.dispatch('fetchPhaseTypes');
const loadHeures = store.dispatch('fetchHeuresExercice');

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
const tab = ref('compte');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres comptabilité</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'compte' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'compte'"
            >Compte</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'categorie' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'categorie'"
            >Catégories comptables</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-exercice' }"
            href="#"
            @click.prevent="tab = 'indemnite-exercice'"
            >Imputation exercice &amp; séance</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-intervention' }"
            href="#"
            @click.prevent="tab = 'indemnite-intervention'"
            >Imputation intervention</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-cours' }"
            href="#"
            @click.prevent="tab = 'indemnite-cours'"
            >Imputation cours</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'heure-exercice' }"
            href="#"
            @click.prevent="tab = 'heure-exercice'"
            >Heures additionnelles pour exercice</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-frais-annuel' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'indemnite-frais-annuel'"
            >Frais &amp; indemnité annuel</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'comptabilite' }"
            href="#"
            @click.prevent="tab = 'comptabilite'"
            >Côtisations sociales</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'amende' }"
            href="#"
            @click.prevent="tab = 'amende'"
            >Amende</a
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-compte v-if="tab === 'compte'" />
      <parametre-ecriture-categorie v-if="tab === 'categorie'" />
      <parametre-indemnite-frais-annuel
        v-if="tab === 'indemnite-frais-annuel'"
      />
      <parametre-heure-exercice v-if="tab === 'heure-exercice'" />
      <parametre-indemnite-exercice v-if="tab === 'indemnite-exercice'" />
      <parametre-indemnite-intervention
        v-if="tab === 'indemnite-intervention'"
      />
      <parametre-indemnite-cours v-if="tab === 'indemnite-cours'" />
      <parametre-avs v-if="tab === 'comptabilite'" />
      <parametre-amende v-if="tab === 'amende'" />
    </div>
  </div>
</template>
