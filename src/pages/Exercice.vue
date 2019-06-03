<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <!-- /.card-header -->
          <div class="card card-primary card-outline mt-3">
            <div class="card-header d-flex justify-content-between">
              <h3>Exercice name</h3>
              <button class="btn btn-outline-primary">
                Sauvegarder
              </button>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Convoque</th>
                  <th>Present</th>
                  <th>Remplace</th>
                  <th>Excuse</th>
                  <th>Amende</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sap in activeExerciceSapeurs" :key="sap.id">
                  <td>
                    {{ sapeurNomPrenom(sap.sapeur_id) }}
                  </td>
                  <td>
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        :id="sap.id + 'convoque'"
                        checked=""
                        v-model="sap.convoque"
                        @change="selectPresent(sap)"
                      />
                      <label
                        class="custom-control-label"
                        :for="sap.id + 'convoque'"
                      ></label>
                    </div>
                  </td>
                  <td>
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        :id="sap.id + 'present'"
                        checked=""
                        v-model="sap.present"
                        @change="selectPresent(sap)"
                      />
                      <label
                        class="custom-control-label"
                        :for="sap.id + 'present'"
                      ></label>
                    </div>
                  </td>
                  <td>
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        :id="sap.id + 'remplace'"
                        checked=""
                        v-model="sap.remplace"
                        @change="selectRemplace(sap)"
                      />
                      <label
                        class="custom-control-label"
                        :for="sap.id + 'remplace'"
                      ></label>
                    </div>
                  </td>
                  <td>
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        :id="sap.id + 'excuse'"
                        checked=""
                        v-model="sap.excuse_type_id"
                        @change.stop.prevent="selectExcuse(sap)"
                      />
                      <label
                        class="custom-control-label"
                        :for="sap.id + 'excuse'"
                      >
                        <span
                          class="ml-2"
                          v-if="
                            sap.excuse_type_id && sap.excuse_type_id !== true
                          "
                          >{{
                            getExcuseType(sap.excuse_type_id).designation
                          }}</span
                        ></label
                      >
                    </div>
                  </td>
                  <td>
                    <div class="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        class="custom-control-input"
                        :id="sap.id + 'amende'"
                        checked=""
                        v-model="sap.amende"
                        :disabled="sap.remplace || sap.present"
                      />
                      <label
                        class="custom-control-label"
                        :for="sap.id + 'amende'"
                      ></label>
                    </div>
                  </td>
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
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'exercice',
  data() {
    return {}
  },
  props: {
    id: {
      type: String
    }
  },
  computed: {
    ...mapGetters([
      'activeExerciceId',
      'activeExerciceData',
      'activeExerciceSapeurs',
      'getLocalite',
      'getSapeur',
      'getExcuseType',
      'listExcuseTypes'
    ])
  },
  mounted() {
    let id = parseInt(this.id)

    this.$store.dispatch('fetchListSapeur')
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    this.$store.dispatch('fetchExcuseTypes')

    this.$store.dispatch('fetchExerciceSapeurs', id)
    //this.$store.dispatch('selectExercice', id)
  },
  watch: {
    activeExerciceId() {
      let id = parseInt(this.id)

      this.$store.dispatch('fetchExerciceSapeurs', id)
      //this.$store.dispatch('selectExercice', id)
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    sapeurNomPrenom(sapeur_id) {
      let sapeur = this.getSapeur(sapeur_id)
      return sapeur.nom + ' ' + sapeur.prenom
    },
    selectPresent(sapeur) {
      sapeur.excuseType = 0
      sapeur.remplace = false
      sapeur.excuse_type_id = false
    },
    selectRemplace(sapeur) {
      sapeur.present = false
      sapeur.amende = false
      sapeur.excuse_type_id = false
    },
    selectExcuse(sapeur) {
      if (sapeur.excuse_type_id === true) {
        sapeur.excuse_type_id === null
      }
      let self = this
      this.SHOW_MODAL({
        component: 'ModalExcuse',
        callback: excuseTypeId => {
          if (excuseTypeId !== null && excuseTypeId !== undefined) {
            let excuseType = self.getExcuseType(excuseTypeId)
            sapeur.present = false
            sapeur.remplace = false
            sapeur.amende = excuseType.amende
            sapeur.excuse_type_id = excuseTypeId
          } else {
            sapeur.excuse_type_id = null
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
