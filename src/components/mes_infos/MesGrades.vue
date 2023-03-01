<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes grades</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="grades"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun grade"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMesGrades = store.dispatch('fetchMesGrades');
  const loadGrades = store.dispatch('fetchGrades');

  Promise.all([loadMesGrades, loadGrades]).then(() => {
    next();
  });
}

export default {
  name: 'MonGrades',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Désignation', key: 'grade' },
        { title: 'Remarques', key: 'remarques' },
      ],
    };
  },
  computed: {
    ...mapState({
      grades: (state) =>
        state.mesInfos.grades
          .map((t) => ({
            ...t,
            grade: state.grade.liste.find((e) => e.id == t.grade_id)
              ?.designation,
          }))
          .sort((a, b) => b.date.localeCompare(a.date)),
    }),
  },
};
</script>

<style scoped></style>
