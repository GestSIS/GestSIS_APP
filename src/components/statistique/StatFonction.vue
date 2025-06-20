<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
store.dispatch('fetchFonctions');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchStatistiqueFonction',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const allFonctions = ref(false);
const fields = [
  { title: 'Fonction', key: 'nom' },
  { title: 'Nombre', key: 'quantite' },
];

const fonctions = computed(() => store.state.fonction.liste);
const sapeurFonctions = computed(() => store.state.statistique.fonctions);
const occurences = computed(() => {
  return sapeurFonctions.value.reduce(
    (prev, { fonction_id, nb }) => (
      (prev[fonction_id] = (prev[fonction_id] ?? 0) + parseFloat(nb)), prev
    ),
    {},
  );
});
const filteredFonction = computed(() => {
  return fonctions.value
    .filter((e) => allFonctions.value || occurences.value[e.id])
    .map((e) => ({ ...e, quantite: occurences.value[e.id] ?? 0 }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats fonctions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-fonction"
            v-model="allFonctions"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-fonction"
            >Afficher toutes les fonctions</label
          >
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredFonction"
          no-data="Aucune fonction"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>
