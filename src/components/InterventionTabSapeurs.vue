<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 col-md-8 col-xl-8">
        <!-- general form elements -->
        <div class="card card-primary card-outline mb-3">
          <!-- /.card-header -->
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Présences</h3>
            <button type="button" class="btn btn-primary" @click="addSapeur">
              Ajouter un sapeur
            </button>
          </div>
          <div class="card-body">
            <div class="table-wrapper">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th rowspan="2">Sapeurs</th>
                    <th rowspan="2">Quittance</th>
                    <th
                      colspan="4"
                      v-for="(col, i) in columns"
                      :key="i"
                      class="text-center"
                    >
                      {{ col }}h
                    </th>
                  </tr>
                  <tr>
                    <th v-for="(col, i) in columns" :key="'1' + i"></th>
                    <th v-for="(col, i) in columns" :key="'2' + i"></th>
                    <th v-for="(col, i) in columns" :key="'3' + i"></th>
                    <th v-for="(col, i) in columns" :key="'4' + i"></th>
                  </tr>
                </thead>
                <tbody>
                  <!--                  <tr v-for="sapeur in listSapeurs" :key="sapeur.id">-->
                  <tr
                    v-for="presence in Object.keys(presences)"
                    :key="presence"
                  >
                    <th>
                      {{ getSapeur(parseInt(presence)) | sapeur }}
                    </th>
                    <td>
                      <div class="custom-control custom-checkbox d-inline">
                        <input
                          type="checkbox"
                          class="custom-control-input"
                          :id="presence"
                          :checked="
                            quittances.filter(
                              s => s.sapeur_id === parseInt(presence)
                            ).length === 1
                          "
                        />
                        <label
                          class="custom-control-label"
                          :for="presence"
                          @click="() => {}"
                        ></label>
                      </div>
                    </td>
                    <td
                      v-for="i in Array(columns.length * 4).keys()"
                      :key="presence + '-' + i"
                      :class="{
                        'bg-secondary': presences[parseInt(presence)][i] === 1,
                        'bg-success': presences[parseInt(presence)][i] === 2
                      }"
                    ></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-4 col-xl-4">
        <!-- general form elements -->
        <div class="card card-primary card-outline mb-3">
          <!-- /.card-header -->
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Phases de l'intervention</h3>
            <button type="button" class="btn btn-primary" @click="newPhase">
              Nouvelle phaseContent
            </button>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Début</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="phase in phases" :key="phase.id">
                  <td>{{ phase.debut }}</td>
                  <td>{{ getPhaseType(phase.phase_type_id).designation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'InterventionTabSapeurs',
  data() {
    return {
      columns: [],
      presences: {
        //sapeur_id:{
        //num col:type,
        //}
      }
    }
  },
  computed: {
    ...mapGetters(['getSapeur', 'getPhaseType']),
    ...mapState({
      id: state => state.intervention.active.id,
      data: state => state.intervention.active.data,
      quittances: state => state.intervention.active.quittances,
      sapeurs: state => state.intervention.active.sapeurs,
      phases: state => state.intervention.active.phases
    }),
    listSapeurs() {
      return Array.from(
        new Set([
          ...this.sapeurs.map(s => s.sapeur_id),
          ...this.quittances.map(s => s.sapeur_id)
        ])
      ).map(id => this.getSapeur(id))
    }
  },
  mounted() {
    this.$store.dispatch('fetchPhaseTypes')
    this.$store.dispatch('fetchInterventionQuittances', this.id)
    this.$store.dispatch('fetchInterventionPhases', this.id)
    this.$store.dispatch('fetchInterventionSapeurs', this.id).then(() => {
      this.listSapeurs.forEach(
        c =>
          (this.presences = {
            ...this.presences,
            [c.id]: this.computeSapeur(c.id)
          })
      )
    })

    let start = new Date(this.data.date_debut + ' ' + this.data.heure_debut)
    let end = new Date(this.data.date_fin + ' ' + this.data.heure_fin)

    let diff = Math.abs(start - end) / 3600000
    let min = start.getHours()
    for (let i = 0; i < diff; ++i) {
      this.columns.push((min + i) % 24)
    }

    // this.listSapeurs.forEach(
    //   c => (this.presences[c.id] = this.computeSapeur(c.id))
    // )
    //TODO Init columns
    //Compute presence to
  },
  methods: {
    addSapeur() {
      //TODO
    },
    newPhase() {
      //TODO
    },
    computeSapeur(id) {
      let res = {}
      let start = new Date(this.data.date_debut + ' ' + this.data.heure_debut)

      this.sapeurs
        .filter(s => s.sapeur_id === id)
        .forEach(q => {
          let diff = ((new Date(q.debut) - start) / 3600000) * 4
          let duree = ((new Date(q.fin) - new Date(q.debut)) / 3600000) * 4

          for (let i = 0; i < duree; ++i) {
            res = {
              ...res,
              [diff + i]: q.piquet ? 2 : 1
            }
          }
        })
      return res
    }
  }
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: scroll;
  overflow-y: visible;
  position: relative;
}

td,
th {
  padding: 5px 20px;
  width: 100px;
}

th:first-child {
  position: relative;
  left: 5px;
}
</style>
