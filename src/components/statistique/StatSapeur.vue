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

async function loadData(_, next) {
  const loadCivilites = store.dispatch('fetchCivilites');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadGrades = store.dispatch('fetchGrades');
  const loadPermisTypes = store.dispatch('fetchPermisType');

  Promise.all([
    loadCivilites,
    loadSapeurs,
    loadFonctions,
    loadGrades,
    loadPermisTypes,
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
};
</script>

<style lang="scss" scoped></style>
