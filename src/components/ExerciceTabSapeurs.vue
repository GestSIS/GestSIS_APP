<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3>
        {{ activeExerciceData.designation }} &ndash;
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
                :disabled="!!(sap.remplace || sap.present)"
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
    <p class="ml-2" v-if="activeExerciceSapeurs.length === 0">Aucun sapeur</p>
    <div class="card-footer">
      <button class="btn btn-outline-primary" @click="manageSapeurs">
        Gérer la liste des sapeurs
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
      this.$store.dispatch('editSapeurs', this.activeExerciceSapeurs)
    },
    sapeurNomPrenom(sapeur_id) {
      let sapeur = this.getSapeur(sapeur_id)
      return sapeur.nom + ' ' + sapeur.prenom
    },
    manageSapeurs() {
      let data = this.activeExerciceSapeurs.map(s => s.sapeur_id).slice(0)
      let svm = this
      let callback = (newSap, removedSap) => {
        if (newSap === null || newSap === undefined) {
          return
        }

        return new Promise((resolve, reject) => {
          let newSapeurs = newSap.map(s => ({
            convoque: false,
            present: false,
            remplace: false,
            excuse_type_id: null,
            sapeur_id: s,
            amende: false
          }))

          let removedSapeurs = removedSap.map(
            id =>
              svm.activeExerciceSapeurs.filter(s => s.sapeur_id === id)[0].id
          )

          //Sapeurs ajoutés
          if (newSapeurs.length > 0) {
            svm.$store
              .dispatch('addSapeurs', newSapeurs)
              .then(() => {
                if (removedSapeurs.length <= 0) {
                  resolve()
                }
              })
              .catch(() => {
                reject("Erreur lors de l'opération")
              })
          }

          if (removedSapeurs.length > 0) {
            svm.$store
              .dispatch('removeSapeurs', removedSapeurs)
              .then(resolve)
              .catch(error => {
                console.error('remove sap error')
                console.error(error)
                reject("Erreur lors de l'opération")
              })
          }

          if (newSapeurs.length <= 0 && removedSapeurs.length <= 0) {
            resolve('Solved')
          }
        })
      }
      //this.$store.dispatch('resetActiveFonction')

      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 1,
        callback,
        data
      })
    },
    selectPresent(sapeur) {
      sapeur.remplace = false
      sapeur.amende = false
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
