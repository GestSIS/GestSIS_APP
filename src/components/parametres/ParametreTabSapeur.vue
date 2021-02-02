<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Cours</h3>
          <button type="button" class="btn btn-primary">
            Ajouter un cours
          </button>
        </div>
        <div class="card-body">
          <table id="cours" class="table table-sm" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Abréviation</th>
                <th>Désignation</th>
                <th>Pré-requis</th>
                <th>Grade</th>
                <th>Fonction</th>
                <th>Validite début</th>
                <th>Validite fin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in listeCours" :key="c.id">
                <td>{{ c.tri }}</td>
                <td>{{ c.abreviation }}</td>
                <td>{{ c.designation }}</td>
                <td>
                  {{ coursPrecedent(c.precedent_id) }}
                </td>
                <td>{{ grade(c.grade_id) }}</td>
                <td>{{ fonction(c.fonction_id) }}</td>
                <td>{{ c.validite_debut }}</td>
                <td>{{ c.validite_fin }}</td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-primary border-0"
                      disabled
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      disabled
                    >
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Fonctions</h3>
          <button type="button" class="btn btn-primary">
            Ajouter une fonction
          </button>
        </div>
        <div class="card-body">
          <table id="fonctions" class="table table-sm" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Abréviation</th>
                <th>Nom</th>
                <th class="text-center">Cumulable</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in listeFonction" :key="f.id">
                <td>{{ f.tri }}</td>
                <td>{{ f.nom }}</td>
                <td>{{ f.abreviation }}</td>
                <td class="text-center">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      id="en_cours"
                      :checked="f.cumulable"
                      disabled
                    />
                    <label class="custom-control-label" for="en_cours"></label>
                  </div>
                </td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-primary border-0"
                      disabled
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      disabled
                    >
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
    coursPrecedent(id) {
      return id ? this.listeCours.find((f) => f.id === id)?.abreviation : "";
    },
    grade(id) {
      return id ? this.listeGrade.find((f) => f.id === id)?.designation : "";
    },
    fonction(id) {
      return id ? this.listeFonction.find((f) => f.id === id)?.designation : "";
    },
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
  watch: {},
};
</script>

<style scoped></style>
