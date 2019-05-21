<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
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
