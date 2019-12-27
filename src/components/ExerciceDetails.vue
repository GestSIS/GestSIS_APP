<template>
  <div class="detail-row d-flex">
    <div class="mr-3">
      Convoqué
      <span
        class="badge"
        :class="{ 'badge-primary': convoque, 'badge-secondary': !convoque }"
        >{{ convoque }}</span
      >
    </div>
    <div class="mr-3">
      Présent
      <span
        class="badge"
        :class="{ 'badge-success': present, 'badge-secondary': !present }"
        >{{ present }}</span
      >
    </div>
    <div class="mr-3">
      Remplacé
      <span
        class="badge"
        :class="{ 'badge-success': remplace, 'badge-secondary': !remplace }"
        >{{ remplace }}</span
      >
    </div>
    <div class="mr-3">
      Excusé
      <span
        class="badge"
        :class="{ 'badge-warning': excuse, 'badge-secondary': !excuse }"
        >{{ excuse }}</span
      >
    </div>
    <div class="mr-3">
      Amende
      <span
        class="badge"
        :class="{ 'badge-danger': amende, 'badge-secondary': !amende }"
        >{{ amende }}</span
      >
    </div>
  </div>
</template>

<script>
import ExerciceService from '@/services/ExerciceService';

export default {
  name: 'ExerciceDetails',
  props: {
    rowData: {
      type: Object,
      required: true
    },
    rowIndex: {
      type: Number
    },
    options: {
      type: Object
    }
  },
  data() {
    return {
      data: {},
      convoque: 0,
      present: 0,
      remplace: 0,
      excuse: 0,
      amende: 0
    };
  },
  mounted() {
    ExerciceService.getSapeurs(this.rowData.id).then(data => {
      this.convoque = data.filter(s => s.convoque).length;
      this.present = data.filter(s => s.present).length;
      this.remplace = data.filter(s => s.remplace).length;
      this.excuse = data.filter(s => s.excuse_type_id).length;
      this.amende = data.filter(s => s.amende).length;
    });
  }
};
</script>

<style scoped>
.detail-row {
  margin-left: 40px;
  border-left: 1px solid lightgray;
  padding: 0.8em;
}
</style>
