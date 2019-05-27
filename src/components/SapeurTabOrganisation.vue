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
              <tr v-for="groupe in activeSapeurGroupes" :key="groupe.id">
                <td>{{ groupe.no !== 0 ? $groupe.no : '' }}</td>
                <td>{{ groupe.nom }}</td>
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
    ...mapGetters(['activeSapeurGroupes', 'activeSapeurId'])
  },
  mounted() {
    if (this.activeSapeurGroupes.length === 0) {
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
