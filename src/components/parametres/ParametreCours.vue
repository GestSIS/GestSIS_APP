<script setup>
import { useModalStore } from '../../stores/common/Modal.js';
import { useCoursStore } from '../../stores/sapeur/Cours.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useGradeStore } from '../../stores/sapeur/Grade.js';
import { computed } from 'vue';
import useNotification from '../../composables/useNotification.js';

const coursStore = useCoursStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();

const loadFonction = fonctionStore.fetchFonctions();
const loadCours = coursStore.fetchCours();
const loadGrade = gradeStore.fetchGrades();

await Promise.all([loadFonction, loadCours, loadGrade]);

const fields = [
  { title: 'Tri', key: 'tri' },
  { title: 'Abréviation', key: 'abreviation' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Durée [jours]', key: 'duree' },
  { title: 'Pré-requis', key: 'cours_precedent' },
  { title: 'Grade', key: 'grade' },
  { title: 'Fonction', key: 'fonction' },
  { title: 'Validite début', key: 'validite_debut', type: Date },
  { title: 'Validite fin', key: 'validite_fin', type: Date },
  { title: 'Actions', slot: 'actions' },
];
const listeCours = computed(() =>
  coursStore.liste
    .map((c) => ({
      ...c,
      grade: gradeStore.liste.find((g) => g.id == c.grade_id)?.designation,
      fonction: fonctionStore.liste.find((g) => g.id == c.fonction_id)?.nom,
      cours_precedent: coursStore.liste.find((g) => g.id == c.precedent_id)
        ?.designation,
    }))
    .sort((a, b) => b.tri - a.tri),
);

const { showModal } = useModalStore();
const awn = useNotification();
const ajoutCours = () => showModal({ component: 'ModalCours', data: {} });
const updateCours = (cours) =>
  showModal({ component: 'ModalCours', data: { ...cours } });
const deleteCours = (cours) =>
  coursStore
    .removeCours(cours.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCours()">
        Ajouter un cours
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeCours"
        :fields="fields"
        no-data="Aucun cours"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
