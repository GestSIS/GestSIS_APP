<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

store.dispatch('fetchMateriels');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchStatistiqueMateriel',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const allMateriels = ref(false);
const fields = [
  {
    title: 'Matériel',
    key: 'designation',
  },
  {
    title: 'Quantité utilisé',
    key: 'quantite',
  },
];

const materiels = computed(() => store.state.materiel.liste);
const materielsIntervention = computed(() => store.state.statistique.materiels);
const occurences = computed(() => {
  return materielsIntervention.value.reduce(
    (prev, { materiel_id, nb }) => (
      (prev[materiel_id] = (prev[materiel_id] ?? 0) + parseFloat(nb)), prev
    ),
    {},
  );
});
const filteredMateriel = computed(() => {
  return materiels.value
    .filter((e) => allMateriels.value || occurences.value[e.id])
    .map((e) => ({ ...e, quantite: occurences.value[e.id] ?? 0 }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats matériel pour interventions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-materiel"
            v-model="allMateriels"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-materiel"
            >Afficher le matériel disponible mais pas référencé durant au moins
            une intervention</label
          >
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredMateriel"
          no-data="Aucun matériel utilisé"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>
