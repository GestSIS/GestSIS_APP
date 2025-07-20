<script setup>
import InterventionTabMateriel from '/src/components/intervention/InterventionTabMateriel.vue';
import InterventionTabVehicule from '/src/components/intervention/InterventionTabVehicule.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="row">
    <InterventionTabMateriel :id="id">Materiels</InterventionTabMateriel>
    <InterventionTabVehicule :id="id">Véhicules</InterventionTabVehicule>
  </div>
</template>
