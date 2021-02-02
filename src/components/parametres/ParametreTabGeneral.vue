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
          <div>TODO Info générales</div>
          <div>
            TODO
            <ul>
              <li>Type de téléphone</li>
              <li>Nombre de numéro max par sapeur</li>
              <li>Liste des cours spécifique au SIS</li>
            </ul>
          </div>
          <div>
            <ul>
              <li>Exercices comptables</li>
              <li>Ajouter, supprimer, clôturer</li>
            </ul>
          </div>
          <div>
            TODO
            <ul>
              <li>Excuses types</li>
              <li>Type d'exercice avec amendable ou non</li>
            </ul>
          </div>
          <div>
            TODO
            <ul>
              <li>Véhicules</li>
              <li>Matériel</li>
              <li>Missions type</li>
              <li>Annuaire de téléphones</li>
              <li>Catégorie intervention</li>
              <li>Stat fédéral -> Dans section admin</li>
            </ul>
          </div>
          <div>
            TODO
            <ul>
              <li>Liste des Comptes</li>
              <li>Type de frais pour exercices</li>
              <li>Type de frais pour interventions</li>
              <li>Catégories de revenus</li>
              <li>Exercices comptabes</li>
              <li>Coordonnées bancaire du SIS pour ISO20022</li>
            </ul>
          </div>
          <div>
            TODO
            <ul>
              <li>Médecins</li>
              <li>Type de contrôles</li>
            </ul>
          </div>
          <div>
            TODO
            <ul>
              <li>Droits et rôles</li>
              <li>Rôle et droits liés aux rôles</li>
            </ul>
          </div>
          <div>
            <p>TODO Nouvelle application ?</p>
            <p>
              Les données suivantes sont celles correspondantes à l'application
              GestSIS 1.0
            </p>
            <ul>
              <li>Localités et communes</li>
              <li>Cours cantonaux</li>
              <li>Fonctions</li>
              <li>Grades</li>
              <li>Stat fédéral</li>
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
  let loadFonction = store.dispatch('fetchFonctions');
  let loadCours = store.dispatch('fetchCours');
  let loadGrade = store.dispatch('fetchGrades');

  Promise.all([loadFonction, loadCours, loadGrade]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabSapeur',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {},
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
  watch: {},
};
</script>

<style scoped></style>
