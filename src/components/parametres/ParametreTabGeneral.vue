<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">General</h3>
          <button type="button" class="btn btn-primary">
            Ajouter un cours
          </button>
        </div>
        <div class="card-body">
          <div>
            <h5>Paramètres Statique pour admin du système</h5>
            <ul>
              <li>Type de téléphone</li>
              <li>Civilites</li>
              <li>Localites et communes</li>
              <li>Stat fédéral</li>
              <li>Permis</li>
              <li>Unites</li>
            </ul>
          </div>
          <div>
            <h5>Sapeur</h5>
            <ul>
              <li>Cours</li>
              <li>Fonctions</li>
              <li>Grades</li>
              <li>Nombre de numéro max par sapeur</li>
            </ul>
          </div>
          <div>
            <h5>Exercices comptables</h5>
            <ul>
              <li>Exercices comptables</li>
              <li>Ajouter, supprimer, clôturer</li>
            </ul>
          </div>
          <div>
            <h5>Exercices</h5>
            <ul>
              <li>Excuses types</li>
              <li>Catégorie d'exercice - &gt;  amendable ou non</li>
            </ul>
          </div>
          <div>
            <h5>Intervention</h5>
            <ul>
              <li>Véhicules</li>
              <li>Matériel</li>
              <li>Missions type</li>
              <li>Annuaire de téléphones</li>
              <li>Type d'intervention</li>
              <li>Stat d'intervention</li>
              <!-- <li>Stat fédéral -&gt; Dans section admin</li> -->
            </ul>
          </div>
          <div>
            <h5>Compatbilité</h5>
            <ul>
              <li>Liste des Comptes</li>
              <li>Indemnités/Soldes pour exercices</li>
              <li>Indemnités/Soldes pour intervention</li>
              <li>Frais annuels</li>
              <li>Indemnités annuels</li>
              <li>Coordonnées bancaire du SIS pour ISO20022</li>
            </ul>
          </div>
          <div>
            <h5>Controles médicaux</h5>
            <ul>
              <li>Médecins</li>
              <li>Type de contrôles</li>
            </ul>
          </div>
          <div>
            <h5>Droits et rôles</h5>
            <ul>
              <li>Gestion des accès -&gt; comptes</li>
              <li>Rôles</li>
              <li>Droits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  // let loadFonction = store.dispatch('fetchFonctions');
  // let loadCours = store.dispatch('fetchCours');
  // let loadGrade = store.dispatch('fetchGrades');

  // Promise.all([loadFonction, loadCours, loadGrade]).then(() => {
    next();
  // });
}

export default {
  name: 'ParametreTabGeneral',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeFonction: (state) =>
        state.fonction.liste.sort((a, b) => a.tri - b.tri),
      listeCours: (state) => state.cours.liste.sort((a, b) => a.tri - b.tri),
      listeGrade: (state) => state.grade.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
};
</script>

<style scoped></style>
