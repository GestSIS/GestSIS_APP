<script setup>
import StatInterventionBasic from "/src/components/statistique/StatInterventionBasic.vue";
import StatVehicule from "/src/components/statistique/StatVehicule.vue";
import StatMateriel from "/src/components/statistique/StatMateriel.vue";
</script>

<template>
  <div class="row">
    <stat-intervention-basic />
    <stat-vehicule />
    <stat-materiel />
  </div>
</template>
