<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useVehiculeStore } from '../../stores/intervention/Vehicule.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useStatistiqueStore } from '../../stores/statistique/Statistique.js';

const vehiculeStore = useVehiculeStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

vehiculeStore.fetchVehicules();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueVehicule(
    exerciceComptableStore.activeId,
  );
  loading.value = false;
});
const allVehicules = ref(false);
const fields = [
  { title: 'Véhicule', key: 'designation' },
  { title: "Nombre d'interventions", key: 'nb' },
];

const vehicules = computed(() => vehiculeStore.liste);
const vehiculesIntervention = computed(() => statistiqueStore.vehicules);
const occurences = computed(() =>
  vehiculesIntervention.value.reduce(
    (prev, vehicule) => (
      (prev[vehicule.vehicule_id] =
        (prev[vehicule.vehicule_id] ?? 0) + parseInt(vehicule.nb)),
      prev
    ),
    {},
  ),
);
const filteredVehicules = computed(() =>
  vehicules.value
    .filter((e) => allVehicules.value || occurences.value[e.id])
    .map((e) => ({ ...e, nb: occurences.value[e.id] ?? 0 })),
);
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats véhicules pour interventions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allVehicules"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les véhicules n'ayant pas effectué d'interventions</label
          >
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredVehicules"
          no-data="Aucun véhicule utilisé"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>
