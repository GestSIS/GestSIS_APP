<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';

const store = useStore();
const loadFonction = store.dispatch('fetchFonctions');
const loadCours = store.dispatch('fetchCours');
const loadGrade = store.dispatch('fetchGrades');

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
  store.state.cours.liste
    .map((c) => ({
      ...c,
      grade: store.state.grade.liste.find((g) => g.id == c.grade_id)
        ?.designation,
      fonction: store.state.fonction.liste.find((g) => g.id == c.fonction_id)
        ?.nom,
      cours_precedent: store.state.cours.liste.find(
        (g) => g.id == c.precedent_id,
      )?.designation,
    }))
    .sort((a, b) => b.tri - a.tri),
);

const { showModal } = useModalStore();
const awn = inject('awn');
const ajoutCours = () => showModal({ component: 'ModalCours', data: {} });
const updateCours = (cours) =>
  showModal({ component: 'ModalCours', data: { ...cours } });
const deleteCours = (cours) =>
  store
    .dispatch('removeCours', cours.id)
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
