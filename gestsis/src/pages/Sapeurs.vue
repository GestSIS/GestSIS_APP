<template>
  <div>
    <h1>Sapeurs</h1>

    <div v-for="sapeur in listSapeur" :key="sapeur.id">{{ sapeur.nom }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  mounted() {
    console.log(this.$store)
    this.$store.dispatch('loadListSapeur')
  },
  data() {
    return {
      key: 12
    }
  },
  props: {
    propName: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters(['listSapeur'])
  }
}
</script>

<style lang="scss" scoped></style>
