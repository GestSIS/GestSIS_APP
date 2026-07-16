<script setup>
import { useSapeurStore } from "../stores/sapeur/Sapeur.js";
import { useLocaliteStore } from "../stores/common/Localite.js";
import { useExerciceCategorieStore } from "../stores/exercice/ExerciceCategorie.js";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceComptableStore = useExerciceComptableStore();

const loadSapeurs = sapeurStore.fetchListeSapeur();
const loadLocalities = localiteStore.fetchLocalites();
const loadExerciceCategories = exerciceCategorieStore.fetchExerciceCategories();
const loadExerciceComptables = exerciceComptableStore.fetchExercicesComptables();

await Promise.all([loadSapeurs, loadLocalities, loadExerciceCategories, loadExerciceComptables]);
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
            <li class="breadcrumb-item active" aria-current="page">Exercices</li>
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
            { to: { name: 'exercices' }, texte: 'Exercices' },
            { to: { name: 'exercices-absences' }, texte: 'Absences' },
          ]"
        />
      </div>
    </div>
    <router-view />
  </div>
</template>
