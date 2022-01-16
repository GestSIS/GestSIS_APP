<template>
  <div class="row">
    <stat-intervention-basic />
    <stat-vehicule />
    <stat-materiel />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import StatInterventionBasic from '@/components/statistique/StatInterventionBasic.vue';
import StatVehicule from '@/components/statistique/StatVehicule.vue';
import StatMateriel from '@/components/statistique/StatMateriel.vue';

async function loadData(_, next) {
  const loadInterventions = store.dispatch('fetchListeIntervention');
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadStats = store.dispatch('fetchStatFederals');
  const loadTraitements = store.dispatch('fetchInterventionTraitements');
  const loadVehicules = store.dispatch('fetchVehicules');
  const loadMateriels = store.dispatch('fetchMateriels');

  // Ajouter ces deux nouvelles interfaces pour les statistiques
  const loadStatVehicules = store.dispatch('fetchStatistiqueMateriel');
  const loadStatMateriel = store.dispatch('fetchStatistiqueVehicule');

  Promise.all([
    loadInterventions,
    loadTypes,
    loadStats,
    loadTraitements,
    loadVehicules,
    loadMateriels,
    loadStatVehicules,
    loadStatMateriel,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'statIntervention',
  components: {
    StatInterventionBasic,
    StatVehicule,
    StatMateriel,
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
    activeExerciceComptableId(newValue, _) {
      this.$store.dispatch('fetchListeIntervention');
      this.$store.dispatch('fetchStatistiqueMateriel');
      this.$store.dispatch('fetchStatistiqueVehicule');
    },
  },
};
</script>

<style lang="scss" scoped></style>
