<template>
  <div id="app">
    <p>Hello World !!! {{ id }}, {{ data }}</p>
  </div>
</template>

<script>
import { Sort, DetailRow } from '@syncfusion/ej2-vue-grids'
import { mapGetters } from 'vuex'

export default {
  name: 'ExerciceDetails',
  computed: {
    ...mapGetters(['listExercices'])
  },
  data() {
    return {
      data: {}
    }
  },
  provide: {
    grid: [Sort, DetailRow]
  }
}
</script>

<style scoped></style>
