<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories</h3>
      <button type="button" class="btn btn-primary">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body">
      <table id="exercice-categories" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th>Durée de base [min]</th>
            <th class="text-center">Amendable</th>
            <th class="text-center">Actif</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in listeCategorie" :key="c.id">
            <td>{{ c.tri }}</td>
            <td>{{ c.designation }}</td>
            <td>{{ c.duree_base }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="amendable"
                  :checked="c.amendable"
                  disabled
                />
                <label class="custom-control-label" for="amendable"></label>
              </div>
            </td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="status"
                  :checked="c.status"
                  disabled
                />
                <label class="custom-control-label" for="amende"></label>
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
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExercice',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeCategorie: (state) =>
        state.exerciceCategorie.liste.sort((a, b) => a.tri - b.tri),
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
