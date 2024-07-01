<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCours()">
        Ajouter un cours
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="listeCours" :fields="fields" no-data="Aucun cours" :selectable="true">
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

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadFonction = store.dispatch('fetchFonctions');
  const loadCours = store.dispatch('fetchCours');
  const loadGrade = store.dispatch('fetchGrades');

  Promise.all([loadFonction, loadCours, loadGrade]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreCours',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
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
      ],
    };
  },
  computed: {
    ...mapState({
      listeCours: (state) =>
        state.cours.liste
          .map((c) => ({
            ...c,
            grade: state.grade.liste.find((g) => g.id == c.grade_id)
              ?.designation,
            fonction: state.fonction.liste.find((g) => g.id == c.fonction_id)
              ?.nom,
            cours_precedent: state.cours.liste.find(
              (g) => g.id == c.precedent_id
            )?.designation,
          }))
          .sort((a, b) => b.tri - a.tri),
      listeFonction: (state) =>
        state.fonction.liste.sort((a, b) => a.tri - b.tri),
      listeGrade: (state) => state.grade.liste.sort((a, b) => b.tri - a.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutCours() {
      this.SHOW_MODAL({ component: 'ModalCours', data: {} });
    },
    updateCours(cours) {
      this.SHOW_MODAL({ component: 'ModalCours', data: { ...cours } });
    },
    deleteCours(cours) {
      this.$store
        .dispatch('removeCours', cours.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
    coursPrecedent(id) {
      return this.listeCours.find((f) => f.id === id)?.abreviation ?? '';
    },
    grade(id) {
      return this.listeGrade.find((f) => f.id === id)?.designation ?? '';
    },
    fonction(id) {
      return this.listeFonction.find((f) => f.id === id)?.nom ?? '';
    },
  },
};
</script>

<style scoped></style>
