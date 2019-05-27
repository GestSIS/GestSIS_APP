<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-body">
          <table id="sap-fonctions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Date</th>
                <th>Abr</th>
                <th>Fonction</th>
                <th>Fin</th>
                <th>Remarques</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in activeSapeurFonctions" :key="f.id">
                <td>{{ f.debut }}</td>
                <td>{{ fonction(f.fonction_id).abreviation }}</td>
                <td>{{ fonction(f.fonction_id).nom }}</td>
                <td>{{ f.fin }}</td>
                <td>{{ f.remarque }}</td>
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
  name: 'SapeurTabFonction',
  computed: {
    ...mapGetters(['activeSapeurFonctions', 'activeSapeurId', 'listFonctions'])
  },
  mounted() {
    if (this.listFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions')
    }
    if (this.activeSapeurFonctions.length === 0) {
      this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurFonctions', id)
    }
  },
  methods: {
    fonction(fonction_id) {
      return this.listFonctions.filter(f => f.id === fonction_id)[0]
    }
  }
}
</script>

<style scoped></style>
