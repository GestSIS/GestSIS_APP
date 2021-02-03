<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button type="button" class="btn btn-primary">
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body">
      <table
        id="fonctions"
        class="table table-sm"
        cellspacing="0"
        width="100%"
      >
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
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  let loadFonction = store.dispatch('fetchFonctions');

  Promise.all([loadFonction]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreFonction',
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
