<template>
  <div class="detail-row d-flex">
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

<script>
import ExerciceService from '@/services/ExerciceService.js';

export default {
  name: 'ExerciceDetails',
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      data: {},
      convoque: 0,
      present: 0,
      remplace: 0,
      excuse: 0,
      amende: 0,
    };
  },
  mounted() {
    ExerciceService.getSapeurs(this.rowData.id).then((data) => {
      this.convoque = data.filter((s) => s.convoque).length;
      this.present = data.filter((s) => s.present).length;
      this.remplace = data.filter((s) => s.remplace).length;
      this.excuse = data.filter((s) => s.excuse_type_id).length;
      this.amende = data.filter((s) => s.amende).length;
    });
  },
};
</script>

<style scoped>
.detail-row {
  margin-left: 33px;
  border-left: 1px solid lightgray;
  padding: 0.8em;
}
</style>
