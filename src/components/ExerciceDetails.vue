<template>
  <div class="detail-row d-flex">
    <div class="spinner-border" role="status" v-show="loading">
      <span class="sr-only">Loading...</span>
    </div>
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
import ExerciceService from '@/services/ExerciceService'

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
      loading: false,
      convoque: 0,
      present: 0,
      remplace: 0,
      excuse: 0,
      amende: 0
    }
  },
  mounted() {
    let svm = this
    ExerciceService.getSapeurs(this.rowData.id).then(data => {
      svm.convoque = data.filter(s => s.convoque).length
      svm.present = data.filter(s => s.present).length
      svm.remplace = data.filter(s => s.remplace).length
      svm.excuse = data.filter(s => s.excuse_type_id).length
      svm.amende = data.filter(s => s.amende).length
      svm.loading = false
    })
  }
}
</script>

<style scoped>
.detail-row {
  margin: 10px;
  padding-left: 40px;
  border-left: 1px;
}
</style>
