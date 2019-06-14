<template>
  <div class="container-fluid">
    <div class="col-sm-12 col-md-4 col-xl-4">
      TODO
    </div>
    <div class="col-sm-12 col-md-8 col-xl-8">
      <table>
        <thead></thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'InterventionTabJournal',
  computed: {
    ...mapState({
      id: state => state.intervention.active.id,
      data: state => state.intervention.active.data,
      missions: state => state.intervention.active.missions,
      appels: state => state.intervention.active.appels
    })
  },
  mounted() {
    this.$store.dispatch('fetchInterventionMissions', this.id)
    this.$store.dispatch('fetchInterventionAppels', this.id)
  }
}
</script>

<style scoped></style>
