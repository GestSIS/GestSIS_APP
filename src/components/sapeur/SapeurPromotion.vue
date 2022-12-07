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
      <base-table
        :fields="fields"
        :data="activeSapeurGrades"
        no-data="Aucun grade"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerGrade(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';
import store from '@/store/index';

async function loadData(routeTo, next) {
  const loadSapeurGrade = store.dispatch('fetchSapeurGrades');

  Promise.all([loadSapeurGrade]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurPromotion',
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
        { title: 'Désignation', key: 'designation' },
        { title: 'Remarques', key: 'remarques' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurGrades: (state) =>
        state.sapeur.active.grades
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((g) => ({
            ...g,
            designation: state.grade.liste.find(
              (grade) => grade.id == g.grade_id
            )?.designation,
          })),
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
    this.$store.dispatch('fetchGrades');
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
    editGrade(grade) {
      this.$store.dispatch('updateActiveGrade', Object.assign({}, grade));
      this.SHOW_MODAL('ModalSapeurPromotion');
    },
    supprimerGrade(grade) {
      this.$store.dispatch('removeSapeurGrade', grade?.id);
    },
  },
};
</script>

<style scoped></style>
