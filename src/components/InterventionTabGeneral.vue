<template>
  <div>General</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InterventionTabGeneral',
  computed: {
    ...mapGetters([
      'activeInterventionId',
      'activeInterventionData',
      // 'activeInterventionSapeurs',
      'listLocalitesSis'
    ])
  }
}
</script>

<style scoped></style>
