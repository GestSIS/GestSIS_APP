<script setup>
import { useCoursStore } from "../../stores/sapeur/Cours.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";

const coursStore = useCoursStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();

const loadFonction = fonctionStore.fetchFonctions();
const loadCours = coursStore.fetchCours();
const loadGrade = gradeStore.fetchGrades();

await Promise.all([loadFonction, loadCours, loadGrade]);
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres sapeurs</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-sapeur-cours' }"
            >Cours</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-sapeur-fonction' }"
            >Fonctions</router-link
          >
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-sapeur-grade' }"
            >Grades</router-link
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <router-view />
    </div>
  </div>
</template>
