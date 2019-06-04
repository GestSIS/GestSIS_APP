<template>
  <div class="card card-primary card-outline mt-3">
    <div class="card-header d-flex justify-content-between">
      <h3>
        {{ activeExerciceData.communication }} &ndash;
        {{ activeExerciceData.date }}
      </h3>
      <button class="btn btn-outline-primary" @click="save">
        Sauvegarder
      </button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Nom</th>
          <th class="text-center">Convoque</th>
          <th class="text-center">Present</th>
          <th class="text-center">Remplace</th>
          <th class="text-center">Excuse</th>
          <th class="text-center">Amende</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sap in activeExerciceSapeurs" :key="sap.id">
          <td>
            {{ sapeurNomPrenom(sap.sapeur_id) }}
          </td>
          <td>
            <div class="custom-control custom-checkbox text-center">
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
            <div class="custom-control custom-checkbox text-center">
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
            <div class="custom-control custom-checkbox text-center">
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
            <div class="custom-control custom-checkbox text-center">
              <input
                type="checkbox"
                class="custom-control-input"
                :id="sap.id + 'excuse'"
                checked=""
                v-model="sap.excuse_type_id"
                @change.stop.prevent="selectExcuse(sap)"
              />
              <label class="custom-control-label" :for="sap.id + 'excuse'">
                <span
                  v-if="sap.excuse_type_id && sap.excuse_type_id !== true"
                  >{{ getExcuseType(sap.excuse_type_id).designation }}</span
                ></label
              >
            </div>
          </td>
          <td>
            <div class="custom-control custom-checkbox text-center">
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
    <div class="card-footer">
      <button class="btn btn-outline-primary">
        Ajouter des sapeurs
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ExerciceTabSapeurs',
  computed: {
    ...mapGetters([
      'activeExerciceId',
      'activeExerciceData',
      'activeExerciceSapeurs',
      'getSapeur',
      'getExcuseType',
      'listExcuseTypes'
    ])
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    save() {
      //TODO
      this.$store.dispatch('editSapeurs', this.activeExerciceSapeurs)
    },
    sapeurNomPrenom(sapeur_id) {
      let sapeur = this.getSapeur(sapeur_id)
      return sapeur.nom + ' ' + sapeur.prenom
    },
    selectPresent(sapeur) {
      sapeur.excuseType = 0
      sapeur.remplace = false
      sapeur.excuse_type_id = null
    },
    selectRemplace(sapeur) {
      sapeur.present = false
      sapeur.amende = false
      sapeur.excuse_type_id = null
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

<style scoped></style>
