<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Grades</h3>
      <button type="button" class="btn btn-primary" @click="ajoutGrade()">Ajouter un grade</button>
    </div>
    <div class="card-body table-responsive">
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
          <tr v-if="!listeGrade.length">
            <td colspan="5">Aucun grade</td>
          </tr>
          <tr v-for="g in listeGrade" :key="g.id">
            <td>{{ g.tri }}</td>
            <td>{{ g.designation }}</td>
            <td>{{ g.abreviation }}</td>
            <td>{{ groupe(g.groupe) }}</td>
            <td class="align-middle text-center">
              <button type="button" class="btn btn-outline-primary border-0" @click="updateGrade(g)">
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button type="button" class="btn btn-outline-danger border-0" @click="deleteGrade(g)">
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
    ...mapMutations(['SHOW_MODAL']),
    ajoutGrade() {
      this.SHOW_MODAL({ component: 'ModalGrade', data: {} });
    },
    updateGrade(grade) {
      this.SHOW_MODAL({ component: 'ModalGrade', data: { ...grade } });
    },
    groupe(groupe) {
      const gradeGroupe = {
        1: 'Officier',
        2: 'Sous-Officier',
        3: 'Spécialiste',
      };
      return gradeGroupe[groupe];
    },
    deleteGrade(grade) {
      this.$store
        .dispatch('removeGrade', grade.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped>
</style>
