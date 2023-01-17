<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats grades</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-grade"
            v-model="allGrades"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-grade"
            >Afficher tous les grades</label
          >
        </div>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="filteredGrade"
          no-data="Aucun grade"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatGrade',
  data() {
    return {
      allGrades: false,
      fields: [
        { title: 'Grade', key: 'designation' },
        { title: 'Nombre', key: 'quantite' },
      ],
    };
  },
  computed: {
    ...mapState({
      grades: (state) => state.grade.liste,
      sapeurs: (state) =>
        state.sapeur.liste
          .map((s) => ({
            ...s,
            grades: new Set(s.grades),
          }))
          .filter((s) => s.actif && s.type === 0),
    }),
    occurences() {
      const occurences = {};
      this.sapeurs.forEach((s) => {
        occurences[s.grade_id] = (occurences[s.grade_id] ?? 0) + 1;
      });
      return occurences;
    },
    filteredGrade() {
      return this.grades
        .filter((e) => this.allGrades || this.occurences[e.id])
        .map((e) => ({ ...e, quantite: this.occurences[e.id] ?? 0 }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
