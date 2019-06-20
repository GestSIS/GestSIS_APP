<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter des présences</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="piquet"
            v-model="piquet"
          />
          <label class="custom-control-label" for="piquet">Piquet</label>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6 col-xl-6">
          <div class="form-group">
            <label for="m-int-date-debut">Date de début</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
              </div>
              <input
                class="form-control"
                :class="{ 'is-invalid': errors['date_debut'] }"
                type="date"
                :min="dateDebutMin"
                :max="dateDebutMax"
                id="m-int-date-debut"
                name="date_debut"
                v-model="date_debut"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="form-group">
            <label for="m-int-heure_debut">Heure</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'clock']" />
                </div>
              </div>
              <input
                type="time"
                class="form-control"
                :class="{ 'is-invalid': errors['heure_debut'] }"
                id="m-int-heure_debut"
                name="heure_debut"
                v-model="heure_debut"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6 col-xl-6">
          <div class="form-group">
            <label for="m-int-date-fin">Date de fin</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
              </div>
              <input
                class="form-control"
                :class="{ 'is-invalid': errors['date_fin'] }"
                :min="dateFinMin"
                :max="dateFinMax"
                type="date"
                id="m-int-date-fin"
                name="date_fin"
                v-model="date_fin"
              />
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-6">
          <div class="form-group">
            <label for="m-int-heure_fin">Heure</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'clock']" />
                </div>
              </div>
              <input
                type="time"
                class="form-control"
                :class="{
                  'is-invalid': errors['heure_fin']
                }"
                id="m-int-heure_fin"
                name="heure_fin"
                v-model="heure_fin"
              />
            </div>
          </div>
        </div>
      </div>
      <ul class="list-group" v-if="!editMode">
        <li v-for="s in listSapeurs" :key="s.id" class="list-group-item">
          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="'sp' + s.id"
              v-model="selectedSapeurs[s.id]"
            />
            <label class="custom-control-label" :for="'sp' + s.id">{{
              s | sapeur
            }}</label>
          </div>
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ editMode ? 'Enregistrer' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: 'ModalPresence',
  props: {
    data: {
      type: Object
    },
    callback: {
      type: Function
    }
  },
  data() {
    return {
      editMode: false,
      date_debut: null,
      date_fin: null,
      heure_debut: null,
      heure_fin: null,
      errors: {},
      selectedSapeurs: {},
      piquet: false,
      sapeurs: [1, 2, 3]
    }
  },
  computed: {
    ...mapGetters(['getSapeur']),
    listSapeurs() {
      return this.sapeurs.map(this.getSapeur)
    },
    heureDebut() {
      return null //this.activeInterventionData.heure_debut
    },
    heureFin() {
      return null //this.activeInterventionData.heure_fin
    },
    dateDebutMin() {
      return null
      // if (!this.currentExerciceComptableId) return
      // return this.exerciceComptableDebut(
      //   this.activeInterventionData.exercice_comptable_id
      // )
    },
    dateDebutMax() {
      return null
      // if (!this.currentExerciceComptableId) return
      // return this.exerciceComptableFin(
      //   this.activeInterventionData.exercice_comptable_id
      // )
    },
    dateFinMin() {
      return null
      // if (!this.currentExerciceComptableId) return
      // return (
      //   this.activeInterventionData.date_debut ||
      //   this.exerciceComptableDebut(
      //     this.activeInterventionData.exercice_comptable_id
      //   )
      // )
    },
    dateFinMax() {
      return null
      // if (!this.currentExerciceComptableId) return
      // return this.exerciceComptableFin(
      //   this.activeInterventionData.exercice_comptable_id
      // )
    }
  },
  mounted() {
    this.editMode = this.data.mode === 'edit'
    console.log(this.data)
    if (this.editMode) {
      this.piquet = this.data.presence.piquet
      this.date_debut = this.data.presence.debut.slice(0, 10)
      this.date_fin = this.data.presence.fin.slice(0, 10)
      this.heure_debut = this.data.presence.debut.slice(11, 16)
      this.heure_fin = this.data.presence.fin.slice(11, 16)
    } else {
      //TODO
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      let debut = this.date_debut + ' ' + this.heure_debut
      let fin = this.date_fin + ' ' + this.heure_fin
      if (this.editMode) {
        let presence = {
          ...this.data.presence,
          debut,
          fin,
          piquet: this.piquet
        }
        this.$store.dispatch('editPresence', presence).then(() => {
          this.callback()
          this.HIDE_MODAL()
        })
      } else {
        let presences = []
        Object.keys(this.selectedSapeurs)
          .filter(s => this.selectedSapeurs[s])
          .forEach(s => {
            presences = [
              ...presences,
              { sapeur_id: s, debut, fin, piquet: this.piquet }
            ]
          })
        this.$store.dispatch('addPresences', presences).then(() => {
          this.callback()
          this.HIDE_MODAL()
        })
      }
    }
  }
}
</script>

<style scoped></style>
