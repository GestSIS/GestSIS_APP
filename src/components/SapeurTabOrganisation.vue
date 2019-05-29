<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-body">
          <table id="sap-groupe" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th data-field="groupe">Groupe</th>
                <th data-field="designation">Désignation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in activeSapeurGroupes" :key="g.id">
                <td>
                  {{
                    (getGroupe(g.groupe_id).no || 0) !== 0
                      ? getGroupe(g.groupe_id).no
                      : ''
                  }}
                </td>
                <td>{{ getGroupe(g.groupe_id).designation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabOrganisation',
  computed: {
    ...mapGetters([
      'activeSapeurId',
      'activeSapeurGroupes',
      'listGroupes',
      'getGroupe'
    ])
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
