<template>
  <div class="row">
    <stat-civilite class="mb-3" />
    <stat-fonction class="mb-3" />
    <stat-grade class="mb-3" />
    <stat-permis class="mb-3" />
  </div>
</template>

<script>
import store from '/src/store/index';

import StatCivilite from '/src/components/statistique/StatCivilite.vue';
import StatFonction from '/src/components/statistique/StatFonction.vue';
import StatGrade from '/src/components/statistique/StatGrade.vue';
import StatPermis from '/src/components/statistique/StatPermis.vue';
import { mapState } from 'vuex';

async function loadData(_, next) {
  const loadCivilites = store.dispatch('fetchCivilites');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadGrades = store.dispatch('fetchGrades');
  const loadPermisTypes = store.dispatch('fetchPermisType');
  let loadStatistiqueCivilite = Promise.resolve();
  let loadStatistiqueFonction = Promise.resolve();
  let loadStatistiqueGrade = Promise.resolve();
  let loadStatistiquePermis = Promise.resolve();

  // Chargement des données uniquement si exerciceComptableId défini
  if (store.state.exerciceComptable.activeId) {
    loadStatistiqueCivilite = store.dispatch('fetchStatistiqueCivilite');
    loadStatistiqueFonction = store.dispatch('fetchStatistiqueFonction');
    loadStatistiqueGrade = store.dispatch('fetchStatistiqueGrade');
    loadStatistiquePermis = store.dispatch('fetchStatistiquePermis');
  }

  Promise.all([
    loadCivilites,
    loadSapeurs,
    loadFonctions,
    loadGrades,
    loadPermisTypes,
    loadStatistiqueCivilite,
    loadStatistiqueFonction,
    loadStatistiqueGrade,
    loadStatistiquePermis,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'StatSapeur',
  components: {
    StatCivilite,
    StatFonction,
    StatGrade,
    StatPermis,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchStatistiqueCivilite');
      this.$store.dispatch('fetchStatistiqueFonction');
      this.$store.dispatch('fetchStatistiqueGrade');
      this.$store.dispatch('fetchStatistiquePermis');
    },
  },
};
</script>
