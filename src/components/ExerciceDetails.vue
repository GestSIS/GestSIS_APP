<template>
  <div class="detail-row d-flex">
    <div class="mr-3">Convoqué <span class="badge badge-primary">12</span></div>
    <div class="mr-3">Présent <span class="badge badge-success">5</span></div>
    <div class="mr-3">Remplacé <span class="badge badge-success">3</span></div>
    <div class="mr-3">Excusé <span class="badge badge-warning">4</span></div>
    <div class="mr-3">Amende <span class="badge badge-danger">5</span></div>
  </div>
</template>

<script>
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
      data: {}
    }
  },
  mounted() {
    //TODO
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
