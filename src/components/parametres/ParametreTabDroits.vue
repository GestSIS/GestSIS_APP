<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Droits</h3>
      <button type="button" class="btn btn-primary">
        TODO What to do ???
      </button>
    </div>
    <div class="card-body">
      <table id="sap-cours" class="table" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th data-field="date">Année</th>
            <th data-field="designation">Désignation</th>
            <th data-field="lieu">Début</th>
            <th class="text-center">Fin</th>
            <th class="text-center">Bouclé</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="e in listeExerciceComptable" :key="e.id">
            <td>{{ e.annee }}</td>
            <td>{{ e.designation }}</td>
            <td>{{ e.debut }}</td>
            <td>{{ e.fin }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="en_cours" :checked="e.boucle" disabled>
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
          </tr> -->
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ParametreTabDroits',
  computed: {
    ...mapState({
      // listeExerciceComptable: state => state.exerciceComptable.liste,
      // activeExerciceComptableId: state => state.exerciceComptable.activeId
    }),
  },
  mounted() {
  },
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
  watch: {
  }
};
</script>

<style scoped></style>
