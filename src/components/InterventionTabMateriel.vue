<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <!-- /.card-header -->
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Matériel</h3>
        <button type="button" class="btn btn-primary" @click="newMateriel">
          Ajouter du matériel
        </button>
      </div>
      <div class="card-body">
        <table id="int-materiel" class="table" cellspacing="0" width="100%">
          <thead>
            <tr>
              <th>Matériel</th>
              <th>Quantité</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody id="materiels">
            <tr v-for="m in materiels" :key="m.id">
              <td>{{ getMateriel(m.materiel_id).designation }}</td>
              <td>{{ m.quantite }}</td>
              <td>
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editMateriel(m.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerMateriel(m.id)"
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
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex'

export default {
  name: 'InterventionTabMateriel',
  computed: {
    ...mapGetters(['getMateriel']),
    ...mapState({
      listMateriels: state => state.materiel.liste,
      materiels: state => state.intervention.active.materiels,
      activeInterventionId: state => state.intervention.active.id
    })
  },
  mounted() {
    if (this.listMateriels.length === 0) {
      this.$store.dispatch('fetchMateriels').then(() => {
        this.$store.dispatch(
          'fetchInterventionMateriels',
          this.activeInterventionId
        )
      })
    } else if (this.materiels.length === 0) {
      this.$store.dispatch(
        'fetchInterventionMateriels',
        this.activeInterventionId
      )
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newMateriel() {
      this.$store.dispatch('resetActiveMateriel')
      this.SHOW_MODAL('ModalMateriel')
    },
    editMateriel(grade_id) {
      this.$store.dispatch(
        'updateActiveMateriel',
        Object.assign({}, this.materiels.filter(m => m.id === grade_id)[0])
      )
      this.SHOW_MODAL('ModalMateriel')
    },
    supprimerMateriel(grade_id) {
      this.$store.dispatch('removeMateriel', grade_id)
    }
  }
}
</script>

<style scoped></style>
