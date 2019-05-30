<template>
  <div id="app">
    <p>Hello World !!!</p>
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
  provide: {
    grid: [Sort, DetailRow]
  }
}
</script>

<style scoped></style>
