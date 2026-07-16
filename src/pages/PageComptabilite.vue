<script setup>
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";

const exerciceComptableStore = useExerciceComptableStore();
await exerciceComptableStore.fetchExercicesComptables();
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
            <li class="breadcrumb-item active" aria-current="page">Comptabilité</li>
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
            { to: { name: 'comptabilite-decompte' }, texte: 'Décomptes' },
            { to: { name: 'comptabilite-compte' }, texte: 'Comptes' },
            {
              to: { name: 'comptabilite-exercice' },
              texte: 'Exercices et Séances',
            },
            {
              to: { name: 'comptabilite-intervention' },
              texte: 'Interventions',
            },
            { to: { name: 'comptabilite-cours' }, texte: 'Cours' },
            {
              to: { name: 'comptabilite-travaux' },
              texte: 'Fiches de travail',
            },
            {
              to: { name: 'comptabilite-annuel' },
              texte: 'Indemnités et Frais annuels',
            },
            { to: { name: 'comptabilite-sapeurs' }, texte: 'Sapeurs' },
            { to: { name: 'comptabilite-divers' }, texte: 'Autres' },
            { to: { name: 'comptabilite-amendes' }, texte: 'Amendes' },
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
