<template>
  <div class="row">
    <stat-categorie-comptable />
    <stat-module-comptable />
    <stat-compte />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

import StatCategorieComptable from '/src/components/statistique/StatCategorieComptable.vue';
import StatModuleComptable from '/src/components/statistique/StatModuleComptable.vue';
import StatCompte from '/src/components/statistique/StatCompte.vue';

async function loadData(_, next) {
  const loadCategorie = store.dispatch('fetchEcritureCategories');
  const loadCompte = store.dispatch('fetchComptes');
  let loadStatCategorie = Promise.resolve();
  let loadStatCompte = Promise.resolve();
  let loadStatModule = Promise.resolve();

  // Chargement des données uniquement si exerciceComptableId défini
  if (store.state.exerciceComptable.activeId) {
    loadStatCategorie = store.dispatch('fetchStatistiqueCategorieComptable');
    loadStatCompte = store.dispatch('fetchStatistiqueCompte');
    loadStatModule = store.dispatch('fetchStatistiqueModuleComptable');
  }

  Promise.all([
    loadCategorie,
    loadCompte,
    loadStatCategorie,
    loadStatCompte,
    loadStatModule,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'StatComptabilite',
  components: {
    StatCategorieComptable,
    StatModuleComptable,
    StatCompte,
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
      this.$store.dispatch('fetchStatistiqueCategorie');
      this.$store.dispatch('fetchStatistiqueCompte');
      this.$store.dispatch('fetchStatistiqueModuleComptable');
    },
  },
};
</script>

<style lang="scss" scoped></style>
