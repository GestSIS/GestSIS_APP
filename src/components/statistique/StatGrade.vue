<script setup>
import { computed, ref, watchEffect } from "vue";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";

const gradeStore = useGradeStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

gradeStore.fetchGrades();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueGrade(exerciceComptableStore.activeId);
  loading.value = false;
});

const allGrades = ref(false);
const fields = [
  { title: "Grade", key: "designation" },
  { title: "Nombre", key: "quantite" },
];

const grades = computed(() => gradeStore.liste);
const sapeurGrades = computed(() => statistiqueStore.grades);
const occurences = computed(() => {
  return sapeurGrades.value.reduce(
    (prev, { grade_id, nb }) => ((prev[grade_id] = (prev[grade_id] ?? 0) + parseFloat(nb)), prev),
    {},
  );
});
const filteredGrade = computed(() => {
  return grades.value
    .filter((e) => allGrades.value || occurences.value[e.id])
    .map((e) => ({ ...e, quantite: occurences.value[e.id] ?? 0 }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats grades</h3>
        <div class="form-check form-switch mb-2">
          <input id="switch-grade" v-model="allGrades" type="checkbox" class="form-check-input" />
          <label class="form-check-label" for="switch-grade">Afficher tous les grades</label>
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredGrade"
          no-data="Aucun grade"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>
