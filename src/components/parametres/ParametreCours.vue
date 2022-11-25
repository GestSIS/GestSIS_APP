<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCours()">
        Ajouter un cours
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="cours" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Abréviation</th>
            <th>Désignation</th>
            <th>Durée [jours]</th>
            <th>Pré-requis</th>
            <th>Grade</th>
            <th>Fonction</th>
            <th>Validite début</th>
            <th>Validite fin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeCours.length">
            <td colspan="9">Aucun cours</td>
          </tr>
          <tr v-for="c in listeCours" :key="c.id">
            <td>{{ c.tri }}</td>
            <td>{{ c.abreviation }}</td>
            <td>{{ c.designation }}</td>
            <td class="text-center">{{ c.duree }}</td>
            <td>{{ coursPrecedent(c.precedent_id) }}</td>
            <td>{{ grade(c.grade_id) }}</td>
            <td>{{ fonction(c.fonction_id) }}</td>
            <td>{{ c.validite_debut }}</td>
            <td>{{ c.validite_fin }}</td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateCours(c)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteCours(c)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
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
  name: 'ParametreCours',
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
      listeCours: (state) => state.cours.liste.sort((a, b) => b.tri - a.tri),
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
