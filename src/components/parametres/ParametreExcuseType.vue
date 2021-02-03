<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Excuses type</h3>
      <button type="button" class="btn btn-primary">Ajouter une excuse</button>
    </div>
    <div class="card-body">
      <table id="excuses-types" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Abréviation</th>
            <th>Désignation</th>
            <th class="text-center">Amende</th>
            <th class="text-center">Actif</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in listeExcuse" :key="e.id">
            <td>{{ e.tri }}</td>
            <td>{{ e.abreviation }}</td>
            <td>{{ e.designation }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="amende"
                  :checked="e.amende"
                  disabled
                />
                <label class="custom-control-label" for="amende"></label>
              </div>
            </td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="status"
                  :checked="e.status"
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
  const loadExcuses = store.dispatch('fetchExcuseTypes');

  Promise.all([loadExcuses]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreExcuseType',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeExcuse: (state) =>
        state.excuseType.liste.sort((a, b) => a.tri - b.tri),
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
