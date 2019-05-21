<template>
  <div class="container-fluid">
    <h1>Sapeurs</h1>
    <div class="row">
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body px-0">
              <form id="f-sapeur-filters" action="/" method="GET">
                <div class="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id="statutActif"
                    name="actif"
                    class="custom-control-input"
                    value="1"
                    checked
                  />
                  <label class="custom-control-label" for="statutActif"
                    >Actif</label
                  >
                </div>
                <div class="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id="statutInactif"
                    name="actif"
                    class="custom-control-input"
                    value="0"
                    checked
                  />
                  <label class="custom-control-label" for="statutInactif"
                    >Inactif</label
                  >
                </div>
                <div class="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id="statutTous"
                    name="actif"
                    class="custom-control-input"
                    value=""
                    checked
                  />
                  <label class="custom-control-label" for="statutTous"
                    >Tous</label
                  >
                </div>
              </form>
            </div>
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="sapeur in listSapeur"
              :key="sapeur.id"
              class="list-group-item list-group-item-action"
              :class="{
                active: activeSapeurId === sapeur.id
              }"
              @click="selectSapeur(sapeur.id)"
            >
              {{ sapeur.nom }} {{ sapeur.prenom }}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-9">
        <SapeurDetails v-if="activeSapeurId > 0" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import SapeurDetails from '@/components/SapeurDetails'

export default {
  components: {
    SapeurDetails
  },
  mounted() {
    this.$store.dispatch('fetchListSapeur').then(() => {
      if (this.activeSapeurId === 0 && this.listSapeur.length > 0) {
        this.selectSapeur(this.listSapeur[0].id)
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
      this.$store.dispatch('fetchSapeurPermis', sapeurId)
    }
  }
}
</script>

<style lang="scss" scoped></style>
