<script setup>
import StatInterventionBasic from '/src/components/statistique/StatInterventionBasic.vue';
import StatVehicule from '/src/components/statistique/StatVehicule.vue';
import StatMateriel from '/src/components/statistique/StatMateriel.vue';
</script>

<template>
  <div class="row">
    <stat-intervention-basic class="mb-3" />
    <stat-vehicule class="mb-3" />
    <stat-materiel class="mb-3" />
  </div>
</template>
