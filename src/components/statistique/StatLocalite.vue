<script setup>
import { computed, ref, watchEffect } from "vue";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";

const localiteStore = useLocaliteStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

localiteStore.fetchLocalites();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueLocalite(exerciceComptableStore.activeId);
  loading.value = false;
});

const fields = [
  { title: "Localité", key: "designation" },
  { title: "Nombre", key: "quantite" },
];

const localites = computed(() => localiteStore.liste);
const sapeurLocalites = computed(() => statistiqueStore.localites);
const occurences = computed(() => {
  return sapeurLocalites.value.reduce(
    (prev, { localite_id, nb }) => (
      (prev[localite_id] = (prev[localite_id] ?? 0) + parseFloat(nb)),
      prev
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
