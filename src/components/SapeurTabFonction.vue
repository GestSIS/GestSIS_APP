<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Fonctions</h3>
          <button type="button" class="btn btn-primary" @click="newFonction">
            Ajouter une fonction
          </button>
        </div>
        <div class="card-body">
          <table id="sap-fonctions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Début</th>
                <th>Fin</th>
                <th>Fonction</th>
                <th>Remarques</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in activeSapeurFonctions" :key="f.id">
                <td>{{ f.debut }}</td>
                <td>{{ f.fin }}</td>
                <td>{{ getFonction(f.fonction_id).nom }}</td>
                <td>{{ f.remarque }}</td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-primary border-0"
                      @click="editFonction(f.id)"
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      @click="supprimerFonction(f.id)"
                    >
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
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
  name: 'SapeurTabFonction',
  computed: {
    ...mapGetters([
      'activeSapeurFonctions',
      'activeSapeurId',
      'listFonctions',
      'getFonction'
    ])
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
    ...mapMutations(['SHOW_MODAL']),
    newFonction() {
      this.$store.dispatch('resetActiveFonction')
      this.SHOW_MODAL('ModalFonction')
    },
    editFonction(fonction_id) {
      this.$store.dispatch(
        'updateActiveFonction',
        this.activeSapeurFonctions.filter(f => f.id === fonction_id)[0]
      )
      this.SHOW_MODAL('ModalFonction')
    },
    supprimerFonction(fonction_id) {
      this.$store.dispatch('removeFonction', fonction_id)
    }
  }
}
</script>

<style scoped></style>
