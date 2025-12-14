<script setup>
import { useCoursStore } from '../../stores/sapeur/Cours.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useGradeStore } from '../../stores/sapeur/Grade.js';
import ParametreCours from './ParametreCours.vue';
import ParametreFonction from './ParametreFonction.vue';
import ParametreGrade from './ParametreGrade.vue';
import { ref } from 'vue';

const coursStore = useCoursStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();

const loadFonction = fonctionStore.fetchFonctions();
const loadCours = coursStore.fetchCours();
const loadGrade = gradeStore.fetchGrades();

await Promise.all([loadFonction, loadCours, loadGrade]);
const tab = ref('cours');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres sapeurs</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'cours' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'cours'"
            >Cours</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'fonction' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'fonction'"
            >Fonctions</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'grade' }"
            href="#"
            @click.prevent="tab = 'grade'"
            >Grades</a
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-cours v-if="tab === 'cours'" />
      <parametre-grade v-if="tab === 'grade'" />
      <parametre-fonction v-if="tab === 'fonction'" />
    </div>
  </div>
</template>
