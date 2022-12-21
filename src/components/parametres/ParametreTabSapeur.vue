<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres sapeurs</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'cours' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'cours'"
            >Cours</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'fonction' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'fonction'"
            >Fonctions</a
          >
          <a
            class="nav-link"
            :class="{ active: tab === 'grade' }"
            href="#"
            @click.prevent="tab = 'grade'"
            >Grades</a
          >
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-cours v-if="tab === 'cours'" />
      <parametre-grade v-if="tab === 'grade'" />
      <parametre-fonction v-if="tab === 'fonction'" />
    </div>
  </div>
</template>

<script>
import store from '/src/store/index';
import ParametreCours from './ParametreCours.vue';
import ParametreFonction from './ParametreFonction.vue';
import ParametreGrade from './ParametreGrade.vue';

async function loadData(_, next) {
  let loadFonction = store.dispatch('fetchFonctions');
  let loadCours = store.dispatch('fetchCours');
  let loadGrade = store.dispatch('fetchGrades');

  Promise.all([loadFonction, loadCours, loadGrade]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabSapeur',
  components: { ParametreCours, ParametreFonction, ParametreGrade },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'cours' };
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
