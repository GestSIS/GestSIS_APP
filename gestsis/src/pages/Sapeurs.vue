<template>
  <div class="container-fluid">
    <h1>Sapeurs</h1>
    <div class="row">
      <div class="col-3">
        <div class="list-group">
          <a
            v-for="sapeur in listSapeur"
            :key="sapeur.id"
            class="list-group-item list-group-item-action"
            :href="'#' + sapeur.nom + ' ' + sapeur.prenom"
            :class="{
              active: activeSapeurId === sapeur.id
            }"
            @click="selectSapeur(sapeur.id)"
            >{{ sapeur.nom }} {{ sapeur.prenom }}</a
          >
        </div>
      </div>
      <div class="col-9">
        <SapeurDetails v-if="activeSapeurId > 0"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import SapeurDetails from '@/components/SapeurDetails'

export default {
  components:{
    SapeurDetails
  },
  mounted() {
    this.$store.dispatch('fetchListSapeur').then(() => {
      console.log(this.activeSapeurId)
      if (this.activeSapeurId === 0 && this.listSapeur.length > 0) {
        console.log('Select first sapeur')
        this.$store.dispatch('fetchSapeur', this.listSapeur[0].id)
      }
    })
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
    ...mapGetters(['listSapeur', 'activeSapeurId']),
    ...mapState(['activeSapeur'])
  },
  methods: {
    selectSapeur(sapeurId) {
      this.$store.dispatch('fetchSapeur', sapeurId)
    }
  }
}
</script>

<style lang="scss" scoped></style>
