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
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMesGrades = store.dispatch('fetchMesGrades');
  let loadGrades = store.dispatch('fetchGrades');

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
        state.mesInfos.grades.map((t) => ({
          ...t,
          grade: state.grades.liste.find((e) => e.id == t.grade_id)
            ?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
