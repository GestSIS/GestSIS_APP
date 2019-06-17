<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <span></span>
      <button class="btn btn-outline-primary" @click="save">
        {{ newMode ? 'Ajouter' : 'Sauvegarder' }}
      </button>
    </div>
    <div class="card-body">
      <!-- NOM -->
      <div class="form-group">
        <label for="m-exe-des">Designation</label>
        <input
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="m-exe-des"
          name="nom"
          v-model="activeExerciceData.designation"
        />
      </div>
      <!-- CATEGORIE -->
      <div class="form-group">
        <label for="m-sap-cat">Categorie</label>
        <select
          class="custom-select required"
          :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
          id="m-sap-cat"
          style="width: 100%"
          v-model="activeExerciceData.exercice_categorie_id"
        >
          <option
            v-for="categorie in listExerciceCategories"
            :key="categorie.id"
            :value="categorie.id"
            >{{ categorie.designation }}</option
          >
        </select>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- DATE -->
          <div class="form-group">
            <label for="m-exe-date">Date</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
              </div>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors['date'] }"
                id="m-exe-date"
                name="nom"
                v-model="activeExerciceData.date"
              />
            </div>
          </div>
        </div>
        <div class="col-6">
          <!-- HEURE -->
          <div class="form-group">
            <label for="m-exe-heure">Heure</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'clock']" />
                </div>
              </div>
              <input
                type="time"
                class="form-control"
                :class="{ 'is-invalid': errors['heure'] }"
                id="m-exe-heure"
                name="nom"
                v-model="activeExerciceData.heure"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- DUREE -->
          <div class="form-group">
            <label for="m-exe-duree">Durée</label>
            <div class="input-group">
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors['duree'] }"
                min="1"
                max="780"
                id="m-exe-duree"
                name="nom"
                v-model="activeExerciceData.duree"
              />
              <div class="input-group-append">
                <span class="input-group-text">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- LOCALITE -->
          <div class="form-group">
            <label for="m-sap-localite">Localité</label>
            <select
              class="custom-select required"
              :class="{ 'is-invalid': errors['localite_id'] }"
              id="m-sap-localite"
              name="localite_id"
              style="width: 100%"
              v-model="activeExerciceData.localite_id"
            >
              <option
                v-for="localite in listLocalitesSis"
                :key="localite.id"
                :value="localite.id"
                >{{ localite.npa + ' ' + localite.designation }}</option
              >
            </select>
          </div>
        </div>
        <div class="col-6">
          <!-- LIEU -->
          <div class="form-group">
            <label for="m-exe-lieu">Lieu</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors['lieu'] }"
              id="m-exe-lieu"
              name="nom"
              v-model="activeExerciceData.lieu"
            />
          </div>
        </div>
      </div>
      <!-- STATUS -->
      <!--                  <div class="form-group">-->
      <!--                    <label for="m-exe-status">status</label>-->
      <!--                    <input-->
      <!--                      type="number"-->
      <!--                      class="form-control"-->
      <!--                      id="m-exe-status"-->
      <!--                      name="nom"-->
      <!--                      v-model="activeExerciceData.status"-->
      <!--                    />-->
      <!--                  </div>-->
      <!-- COMMUNICATION -->
      <div class="form-group">
        <label for="m-sap-communication">Communications</label>
        <textarea
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors['communications'] }"
          id="m-sap-communication"
          name="communications"
          v-model="activeExerciceData.communications"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ExerciceTabGeneral',
  computed: {
    ...mapGetters([
      'activeExerciceId',
      'activeExerciceData',
      'activeExerciceSapeurs',
      'listLocalitesSis',
      'listExerciceCategories',
      'getExerciceCategorie',
      'currentExerciceComptableId'
    ]),
    exerciceCategorie() {
      return this.activeExerciceData.exercice_categorie_id
    },
    exerciceHeure() {
      return this.activeExerciceData.heure
    }
  },
  props: {
    newMode: Boolean
  },
  data() {
    return {
      errors: {},
      loading: true
    }
  },
  watch: {
    exerciceCategorie(value) {
      this.activeExerciceData.duree =
        this.activeExerciceData.duree ||
        this.getExerciceCategorie(value).duree_base
    },
    exerciceHeure(data) {
      this.activeExerciceData.heure = this.formatHeure(data)
    }
  },
  mounted() {
    this.activeExerciceData.heure = this.formatHeure(
      this.activeExerciceData.heure
    )
  },
  methods: {
    save() {
      if (this.newMode) {
        this.$store
          .dispatch('createExercice', this.activeExerciceData)
          .then(data => {
            this.$router.push('/exercices/' + data.id)
            this.errors = {}
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('saveActiveExercice', this.activeExerciceData)
          .then(() => (this.errors = {}))
          .catch(errors => (this.errors = errors))
      }
    },
    formatHeure(value) {
      if (value && value.length >= 8) {
        return value.slice(0, 5)
      }
      return value
    }
  }
}
</script>

<style scoped></style>
