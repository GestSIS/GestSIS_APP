<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Grades</h3>
      <button type="button" class="btn btn-primary">Ajouter un grade</button>
    </div>
    <div class="card-body">
      <table id="fonctions" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Abréviation</th>
            <th>Désignation</th>
            <th class="text-center">Groupe</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in listeGrade" :key="f.id">
            <td>{{ f.tri }}</td>
            <td>{{ f.designation }}</td>
            <td>{{ f.abreviation }}</td>
            <td>{{ groupe(f.groupe) }}</td>
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
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  let loadGrade = store.dispatch('fetchGrades');

  Promise.all([loadGrade]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreGrade',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeGrade: (state) => state.grade.liste.sort((a, b) => b.tri - a.tri),
    }),
  },
  methods: {
    groupe(groupe) {
      const gradeGroupe = {
        1: 'Officier',
        2: 'Sous-Officier',
        3: 'Spécialiste',
      };
      return gradeGroupe[groupe];
    },
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
};
</script>

<style scoped></style>
