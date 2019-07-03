<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-body">
          <table id="sap-groupe" class="table">
            <thead>
              <tr>
                <th data-field="groupe">Groupe</th>
                <th data-field="designation">Désignation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in groupeDisplay" :key="g.id">
                <td>
                  {{ g.no }}
                </td>
                <td>{{ g.designation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'SapeurTabOrganisation',
  computed: {
    ...mapState({
      listGroupes: state => state.groupe.liste,
      activeSapeurId: state => state.sapeur.active.id,
      activeSapeurGroupes: state => state.sapeur.active.groupes
    }),
    ...mapGetters(['getGroupe']),
    groupeDisplay() {
      let svm = this
      return this.activeSapeurGroupes.map(groupe => {
        let g = svm.getGroupe(groupe.groupe_id)
        return {
          id: groupe.id,
          designation: g.designation,
          no: g.no || ''
        }
      })
    }
  },
  mounted() {
    if (this.listGroupes.length === 0) {
      this.$store.dispatch('fetchGroupes').then(() => {
        this.$store.dispatch('fetchSapeurGroupes', this.activeSapeurId)
      })
    } else {
      this.$store.dispatch('fetchSapeurGroupes', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGroupes', id)
    }
  }
}
</script>

<style scoped></style>
