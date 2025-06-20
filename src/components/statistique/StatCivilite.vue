<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
store.dispatch('fetchCivilites');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchStatistiqueCivilite',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const fields = [
  { title: 'Civilité', key: 'designation' },
  { title: 'Nombre', key: 'quantite' },
];

const civilites = computed(() => store.state.baseData.civilites);
const sapeurCivilites = computed(() => store.state.statistique.civilites);
const occurences = computed(() => {
  return sapeurCivilites.value.reduce(
    (prev, { civilite_id, nb }) => (
      (prev[civilite_id] = (prev[civilite_id] ?? 0) + parseFloat(nb)), prev
    ),
    {},
  );
});
const filteredCivilite = computed(() => {
  return civilites.value.map((e) => ({
    ...e,
    quantite: occurences.value[e.id] ?? 0,
  }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats sapeurs</h3>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredCivilite"
          no-data="Aucun sapeur"
          :selectable="true"
        >
          <template #foot>
            <tr>
              <th>Total :</th>
              <th>
                {{
                  Object.values(occurences).reduce(
                    (partialSum, a) => partialSum + (parseInt(a) ?? 0),
                    0,
                  )
                }}
              </th>
            </tr>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
