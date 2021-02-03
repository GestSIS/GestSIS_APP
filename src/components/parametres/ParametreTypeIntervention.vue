<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Type d'intervention</h3>
          <button type="button" class="btn btn-primary">Ajouter un type</button>
        </div>
        <div class="card-body">
          <table id="type-intervention" class="table table-sm">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Type d'intervention</th>
                <th>Statistiques</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in listeType" :key="t.id">
                <td>{{ t.tri }}</td>
                <td>{{ t.designation }}</td>
                <td>{{ statistique(t.stat_intervention_id) }}</td>
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
          <h3 class="card-title">Statistiques</h3>
          <button type="button" class="btn btn-primary">
            Ajouter un type de statistique
          </button>
        </div>
        <div class="card-body">
          <table id="statistiques" class="table table-sm">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Désignation</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in listeStat" :key="s.id">
                <td>{{ s.tri }}</td>
                <td>{{ s.designation }}</td>
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
  const loadStatIntervention = store.dispatch('fetchStatInterventions');
  const loadTypeIntervention = store.dispatch('fetchTypeInterventions');

  Promise.all([loadStatIntervention, loadTypeIntervention]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTypeIntervention',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeType: (state) =>
        state.typeIntervention.liste.sort((a, b) => a.tri - b.tri),
      listeStat: (state) =>
        state.statIntervention.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    statistique(id) {
      return id ? this.listeStat.find((s) => s.id === id)?.designation : '';
    },
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
};
</script>

<style scoped></style>
