<template>
  <p>TODO</p>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabPromotion',
  data() {
    return {
      publicPath: process.env.BASE_URL
    }
  },
  computed: {
    ...mapGetters(['listPermisType', 'activeSapeurPermis'])
  },
  mounted() {
    if (this.listPermisType.length === 0) {
      this.$store.dispatch('fetchPermisType')
    }
  }
}
</script>

<style scoped></style>
