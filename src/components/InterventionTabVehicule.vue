<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <!-- /.card-header -->
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Véhicules</h3>
        <button type="button" class="btn btn-primary" @click="save">
          Enregistrer
        </button>
      </div>
      <div class="card-body">
        <table id="int-vehicules" class="table">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Présent</th>
            </tr>
          </thead>
          <tbody id="vehicules">
            <tr
              v-for="v in listVehicules.filter(item => item.status === 1)"
              :key="v.id"
            >
              <td>{{ v.designation }}</td>
              <td>
                <div class="form-group">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'v-' + v.id"
                      v-model="vehicules[v.id]"
                    />
                    <label
                      class="custom-control-label"
                      :for="'v-' + v.id"
                    ></label>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'InterventionTabVehicules',
  data() {
    return {
      vehicules: {}
    }
  },
  computed: {
    ...mapGetters(['getVehicule']),
    ...mapState({
      listVehicules: state => state.vehicule.liste,
      interventionVehicules: state => state.intervention.active.vehicules,
      activeInterventionId: state => state.intervention.active.id
    })
  },
  mounted() {
    if (this.listVehicules.length === 0) {
      this.$store.dispatch('fetchVehicules').then(() => {
        this.$store
          .dispatch('fetchInterventionVehicules', this.activeInterventionId)
          .then(() => this.updateVehicules(this.interventionVehicules))
      })
    } else if (this.interventionVehicules.length === 0) {
      this.$store
        .dispatch('fetchInterventionVehicules', this.activeInterventionId)
        .then(() => {
          this.updateVehicules(this.interventionVehicules)
        })
    } else {
      this.updateVehicules(this.interventionVehicules)
    }
  },
  watch: {
    interventionVehicules(value) {
      this.updateVehicules(value)
    }
  },
  methods: {
    save() {
      let vehiculesIds = this.interventionVehicules.map(v => v.vehicule_id)
      let ids = Object.keys(this.vehicules)
        .filter(item => this.vehicules[item])
        .map(x => parseInt(x))

      //New One
      let newOne = ids.filter(item => !vehiculesIds.includes(item))

      //Removed
      let removed = vehiculesIds.filter(item => !ids.includes(item))
      let removedIds = removed.map(
        vehicule_id =>
          this.interventionVehicules
            .filter(v => v.vehicule_id === vehicule_id)
            .map(v => v.id)[0]
      )

      if (removedIds.length > 0) {
        this.$store.dispatch('removeVehicules', removedIds)
      }
      if (newOne.length > 0) {
        this.$store.dispatch('addVehicules', newOne)
      }
    },
    updateVehicules(value) {
      this.vehicules = {}
      let svm = this

      value.forEach(
        v => (svm.vehicules = { ...svm.vehicules, [v.vehicule_id]: true })
      )
    }
  }
}
</script>

<style scoped></style>
