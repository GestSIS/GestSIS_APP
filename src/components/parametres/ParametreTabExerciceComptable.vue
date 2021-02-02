<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices comptables</h3>
      <button
        type="button"
        class="btn btn-primary"
        @click="newExerciceComptable"
      >
        Ajouter un exercice comptable
      </button>
    </div>
    <div class="card-body">
      <table id="sap-cours" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Année</th>
            <th>Désignation</th>
            <th>Début</th>
            <th>Fin</th>
            <th class="text-center">Bouclé</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in listeExerciceComptable" :key="e.id">
            <td>{{ e.annee }}</td>
            <td>{{ e.designation }}</td>
            <td>{{ e.debut }}</td>
            <td>{{ e.fin }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="en_cours"
                  :checked="e.boucle"
                  disabled
                />
                <label class="custom-control-label" for="en_cours"></label>
              </div>
            </td>
            <td>
              <!-- TODO Implement those 2 buttons -->
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
  const loadExerciceComptable = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExerciceComptable]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExerciceComptable',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {},
  computed: {
    ...mapState({
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
  },
  methods: {
    newExerciceComptable() {},
    save() {},
  },
  watch: {},
};
</script>

<style scoped></style>
