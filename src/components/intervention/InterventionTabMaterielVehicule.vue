<script setup>
import InterventionMateriel from "/src/components/intervention/InterventionMateriel.vue";
import InterventionVehicule from "/src/components/intervention/InterventionVehicule.vue";

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="row">
    <InterventionMateriel :id="id">Materiels</InterventionMateriel>
    <InterventionVehicule :id="id">Véhicules</InterventionVehicule>
  </div>
</template>
