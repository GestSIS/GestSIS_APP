<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Matériel</h3>
          <button type="button" class="btn btn-primary" @click="newMateriel">
            Ajouter du matériel
          </button>
        </div>
        <div class="card-body">
          <table id="sap-promotions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Matériel</th>
                <th>Quantité</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in activeInterventionMateriels" :key="m.id">
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
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'InterventionTabMateriel',
  computed: {
    ...mapGetters([
      'activeInterventionMateriels',
      'activeInterventionId',
      'listMateriels',
      'getMateriel'
    ])
  },
  mounted() {
    if (this.listMateriels.length === 0) {
      this.$store.dispatch('fetchMateriels')
    }
    if (this.activeInterventionMateriels.length === 0) {
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
      this.SHOW_MODAL('ModalPromotion')
    },
    editMateriel(grade_id) {
      this.$store.dispatch(
        'updateActiveMateriel',
        Object.assign(
          {},
          this.activeSapeurMateriels.filter(f => f.id === grade_id)[0]
        )
      )
      this.SHOW_MODAL('ModalPromotion')
    },
    supprimerMateriel(grade_id) {
      this.$store.dispatch('removeMateriel', grade_id)
    }
  }
}
</script>

<style scoped></style>
