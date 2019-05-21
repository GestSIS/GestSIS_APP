<template>
  <div class="row">
    <div class="col-12">
      <h1>Work in Progress</h1>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabExercice',
  computed: {
    ...mapGetters(['activeSapeur'])
  }
}
</script>

<style scoped></style>
