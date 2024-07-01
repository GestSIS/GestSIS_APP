<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Grades</h3>
      <button type="button" class="btn btn-primary" @click="ajoutGrade()">
        Ajouter un grade
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="listeGrade" :fields="fields" no-data="Aucun grade" :selectable="true">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadGrade = store.dispatch('fetchGrades');

  Promise.all([loadGrade]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreGrade',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Tri', key: 'tri' },
        { title: 'Abréviation', key: 'abreviation' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Groupe', key: 'groupeDesignation' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeGrade: (state) =>
        state.grade.liste
          .map((g) => ({
            ...g,
            groupeDesignation: {
              1: 'Officier',
              2: 'Sous-Officier',
              3: 'Sapeur',
            }[g?.groupe ?? 0],
          }))
          .sort((a, b) => b.tri - a.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutGrade() {
      this.SHOW_MODAL({ component: 'ModalGrade', data: {} });
    },
    updateGrade(grade) {
      this.SHOW_MODAL({ component: 'ModalGrade', data: { ...grade } });
    },
    deleteGrade(grade) {
      this.$store
        .dispatch('removeGrade', grade.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
