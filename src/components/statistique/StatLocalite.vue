<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
store.dispatch('fetchLocalites');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchStatistiqueLocalite',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const fields = [
  { title: 'Localité', key: 'designation' },
  { title: 'Nombre', key: 'quantite' },
];

const localites = computed(() => store.state.localite.liste);
const sapeurLocalites = computed(() => store.state.statistique.localites);
const occurences = computed(() => {
  return sapeurLocalites.value.reduce(
    (prev, { localite_id, nb }) => (
      (prev[localite_id] = (prev[localite_id] ?? 0) + parseFloat(nb)), prev
    ),
    {},
  );
});
const filteredLocalite = computed(() => {
  return localites.value
    .filter((e) => occurences.value[e.id])
    .map((e) => ({
      ...e,
      quantite: occurences.value[e.id] ?? 0,
    }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats localités</h3>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredLocalite"
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
