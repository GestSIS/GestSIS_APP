<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Cours</h3>
          <button
            type="button"
            class="btn btn-primary"
            @click="SHOW_MODAL('ModalCours')"
          >
            Ajouter un cours
          </button>
        </div>
        <div class="card-body">
          <table id="sap-cours" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th data-field="date">Date</th>
                <th data-field="Abr">Abr</th>
                <th data-field="designation">Désignation</th>
                <th data-field="lieu">Lieu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in activeSapeurCours" :key="c.id">
                <td>{{ c.date }}</td>
                <td>{{ getCours(c.cours_id).abreviation }}</td>
                <td>{{ getCours(c.cours_id).designation }}</td>
                <td>{{ getLocalite(c.localite_id).designation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'SapeurTabCours',
  computed: {
    ...mapGetters([
      'activeSapeurCours',
      'activeSapeurId',
      'listCours',
      'getCours',
      'getLocalite'
    ])
  },
  mounted() {
    if (this.listCours.length === 0) {
      this.$store.dispatch('fetchCours')
    }
    if (this.activeSapeurCours.length === 0) {
      this.$store.dispatch('fetchSapeurCours', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id)
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL'])
  }
}
</script>

<style scoped></style>
