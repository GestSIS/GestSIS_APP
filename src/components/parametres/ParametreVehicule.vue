<script setup>
import { computed } from 'vue';
import { useVehiculeStore } from '../../stores/intervention/Vehicule.js';

const vehiculeStore = useVehiculeStore();
await vehiculeStore.fetchVehicules();

const fields = [
  { columnClass: 'col-2', title: 'Actif', key: 'statut', type: Boolean },
  { title: 'Désignation', key: 'designation' },
];

const vehicules = computed(() =>
  vehiculeStore.liste.sort((a, b) => a.tri - b.tri),
);
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Véhicules</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="vehicules"
        :fields="fields"
        no-data="Aucun véhicule"
        :selectable="true"
      />
    </div>
  </div>
</template>
