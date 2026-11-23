<script setup>
import { computed } from "vue";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { useGradeStore } from "../../stores/sapeur/Grade.js";

const infosStore = useMesInfosStore();
const gradeStore = useGradeStore();

await Promise.all([infosStore.fetchMesGrades(), gradeStore.fetchGrades()]);

const grades = computed(() =>
  infosStore.grades
    .map((t) => ({
      ...t,
      grade: gradeStore.liste.find((e) => e.id == t.grade_id)?.designation,
    }))
    .sort((a, b) => b.date.localeCompare(a.date)),
);

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Désignation", key: "grade" },
  { title: "Remarques", key: "remarques" },
];
</script>

<template>
  <base-card title="Mes grades">
    <template #body-table>
      <base-table
        class="table-striped"
        :fields="fields"
        :data="grades"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun grade"
      />
    </template>
  </base-card>
</template>
