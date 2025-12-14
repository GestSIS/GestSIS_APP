<script setup>
import { useSapeurStore } from '../stores/sapeur/Sapeur.js';
import { useLocaliteStore } from '../stores/common/Localite.js';
import { useBaseDataStore } from '../stores/common/BaseData.js';
import { useGroupeStore } from '../stores/groupe/Groupe.js';
import { useFonctionStore } from '../stores/sapeur/Fonction.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const groupeStore = useGroupeStore();
const fonctionStore = useFonctionStore();

const loadSapeurs = sapeurStore.fetchListeSapeur();
const loadLocalities = localiteStore.fetchLocalites();
const loadGroupes = groupeStore.fetchGroupes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadPermisType = baseDataStore.fetchPermisType();

await Promise.all([
  loadSapeurs,
  loadLocalities,
  loadGroupes,
  loadFonctions,
  loadPermisType,
]);
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Absences</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'absences' }, texte: 'Tableau de bord' },
            { to: { name: 'absences-liste' }, texte: 'Liste' },
          ]"
        />
      </div>
    </div>
    <router-view />
  </div>
</template>
