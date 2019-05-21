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
