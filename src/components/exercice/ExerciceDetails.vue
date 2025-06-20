<script setup>
import { onMounted, ref } from 'vue';
import ExerciceService from '/src/services/ExerciceService.js';

const { rowData } = defineProps({
  rowData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const convoque = ref(0);
const present = ref(0);
const absent = ref(0);
const remplace = ref(0);
const excuse = ref(0);
const amende = ref(0);

onMounted(() =>
  ExerciceService.getSapeurs(rowData.id).then((data) => {
    convoque.value = data.filter((s) => s.convoque).length;
    present.value = data.filter((s) => s.present).length;
    absent.value = data.filter((s) => s.absent).length;
    remplace.value = data.filter((s) => s.remplace).length;
    excuse.value = data.filter((s) => s.excuse_type_id).length;
    amende.value = data.filter((s) => s.amende).length;
  }),
);
</script>

<template>
  <div class="detail-row-padding d-flex">
    <div class="me-3">
      Convoqué
      <span
        class="badge"
        :class="{ 'bg-primary': convoque, 'bg-secondary': !convoque }"
        >{{ convoque }}</span
      >
    </div>
    <div class="me-3">
      Présent
      <span
        class="badge"
        :class="{ 'bg-success': present, 'bg-secondary': !present }"
        >{{ present }}</span
      >
    </div>
    <div class="me-3">
      Remplacé
      <span
        class="badge"
        :class="{ 'bg-success': remplace, 'bg-secondary': !remplace }"
        >{{ remplace }}</span
      >
    </div>
    <div class="me-3">
      Absent
      <span
        class="badge"
        :class="{ 'bg-warning': absent, 'bg-secondary': !absent }"
        >{{ absent }}</span
      >
    </div>
    <div class="me-3">
      Excusé
      <span
        class="badge"
        :class="{ 'bg-warning': excuse, 'bg-secondary': !excuse }"
        >{{ excuse }}</span
      >
    </div>
    <div class="me-3">
      Amende
      <span
        class="badge"
        :class="{ 'bg-danger': amende, 'bg-secondary': !amende }"
        >{{ amende }}</span
      >
    </div>
  </div>
</template>

<style scoped>
.detail-row-padding {
  padding: 0.8em;
}
</style>
