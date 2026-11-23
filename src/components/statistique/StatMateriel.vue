<script setup>
import { computed, ref, watchEffect } from "vue";
import { useMaterielStore } from "../../stores/intervention/Materiel.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";

const materielStore = useMaterielStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

materielStore.fetchMateriels();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueMateriel(exerciceComptableStore.activeId);
  loading.value = false;
});

const allMateriels = ref(false);
const fields = [
  {
    title: "Matériel",
    key: "designation",
  },
  {
    title: "Quantité utilisé",
    key: "quantite",
  },
];

const materiels = computed(() => materielStore.liste);
const materielsIntervention = computed(() => statistiqueStore.materiels);
const occurences = computed(() => {
  return materielsIntervention.value.reduce(
    (prev, { materiel_id, nb }) => (
      (prev[materiel_id] = (prev[materiel_id] ?? 0) + parseFloat(nb)),
      prev
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
    <base-card title="Stats matériel pour interventions">
      <template #header>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-materiel"
            v-model="allMateriels"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-materiel"
            >Afficher le matériel disponible mais pas référencé durant au moins une
            intervention</label
          >
        </div>
      </template>
      <template #body-table>
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredMateriel"
          no-data="Aucun matériel utilisé"
          :selectable="true"
        />
      </template>
    </base-card>
  </div>
</template>
