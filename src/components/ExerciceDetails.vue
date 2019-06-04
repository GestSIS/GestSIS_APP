<template>
  <div class="detail-row">
    <table class="table">
      <tbody>
        <tr>
          <th class="border-0">
            Convoqué <span class="badge badge-primary">12</span>
          </th>
          <th class="border-0">
            Présent <span class="badge badge-success">5</span>
          </th>
          <th class="border-0">
            Remplacé <span class="badge badge-success">3</span>
          </th>
          <th class="border-0">
            Excusé <span class="badge badge-warning">4</span>
          </th>
          <th class="border-0">
            Amende <span class="badge badge-danger">5</span>
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ExerciceDetails',
  props:{
    rowData: {
      type: Object,
      required: true
    },
    rowIndex: {
      type: Number
    },
    options: {
      type: Object,
    }
  },
  data() {
    return {
      data: {}
    }
  },
  mounted() {
    console.log('Test')
  }
}
</script>

<style scoped>
  .detail-row{
    padding-left:50px;
    border-left:1px;
  }
</style>
