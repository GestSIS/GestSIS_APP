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
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadStats = store.dispatch('fetchStatFederals');
  const loadTraitements = store.dispatch('fetchInterventionTraitements');
  const loadVehicules = store.dispatch('fetchVehicules');
  const loadMateriels = store.dispatch('fetchMateriels');
  let loadInterventions = Promise.resolve();
  let loadStatVehicules = Promise.resolve();
  let loadStatMateriel = Promise.resolve();
  let loadTypeIntervention = Promise.resolve();
  let loadStatFederal = Promise.resolve();
  let loadTraitementIntervention = Promise.resolve();

  // Chargement des données uniquement si exerciceComptableId défini
  if (store.state.exerciceComptable.activeId) {
    loadInterventions = store.dispatch('fetchListeIntervention');
    loadStatVehicules = store.dispatch('fetchStatistiqueMateriel');
    loadStatMateriel = store.dispatch('fetchStatistiqueVehicule');
    loadTypeIntervention = store.dispatch('fetchStatistiqueTypeIntervention');
    loadStatFederal = store.dispatch('fetchStatistiqueStatFederal');
    loadTraitementIntervention = store.dispatch(
      'fetchStatistiqueTraitementIntervention'
    );
  }

  Promise.all([
    loadInterventions,
    loadTypes,
    loadStats,
    loadTraitements,
    loadVehicules,
    loadMateriels,
    loadStatVehicules,
    loadStatMateriel,
    loadTypeIntervention,
    loadStatFederal,
    loadTraitementIntervention,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'StatIntervention',
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
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeIntervention');
      this.$store.dispatch('fetchStatistiqueMateriel');
      this.$store.dispatch('fetchStatistiqueVehicule');
      this.$store.dispatch('fetchStatistiqueTypeIntervention');
      this.$store.dispatch('fetchStatistiqueStatFederal');
      this.$store.dispatch('fetchStatistiqueTraitementIntervention');
    },
  },
};
</script>

<style lang="scss" scoped></style>
