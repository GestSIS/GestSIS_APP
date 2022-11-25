<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Promotions</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newGrade"
      >
        Ajouter une promotion
      </button>
    </div>
    <div class="card-body table-responsive">
      <table
        id="sap-promotions"
        class="table table-sm"
        cellspacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Désignation</th>
            <th>Remarques</th>
            <th v-if="hasEditPermission" class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="activeSapeurGrades.length <= 0">
            <td :colspan="hasEditPermission ? 4 : 3">Aucun grade</td>
          </tr>
          <tr v-for="g in activeSapeurGrades" :key="g.id">
            <td>{{ new Date(g.date).toLocaleDateString('fr-CH') }}</td>
            <td>{{ formatGrade(grades.find((e) => e.id == g.grade_id)) }}</td>
            <td>{{ g.remarque }}</td>
            <td v-if="hasEditPermission" class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="editGrade(g.id)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerGrade(g.id)"
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
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'SapeurPromotion',
  computed: {
    ...mapState({
      grades: (state) => state.grade.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurGrades: (state) =>
        state.sapeur.active.grades.sort((a, b) => b.date.localeCompare(a.date)),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGrades', id);
    },
  },
  mounted() {
    if (this.grades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
    this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatGrade(grade) {
      return grade?.designation;
    },
    newGrade() {
      this.$store.dispatch('resetActiveGrade');
      this.SHOW_MODAL('ModalSapeurPromotion');
    },
    editGrade(grade_id) {
      this.$store.dispatch(
        'updateActiveGrade',
        Object.assign(
          {},
          this.activeSapeurGrades.find((f) => f.id == grade_id)
        )
      );
      this.SHOW_MODAL('ModalSapeurPromotion');
    },
    supprimerGrade(grade_id) {
      this.$store.dispatch('removeSapeurGrade', grade_id);
    },
  },
};
</script>

<style scoped></style>
