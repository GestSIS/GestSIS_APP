<template>
  <div class="card card-primary card-outline mt-3">
    <div class="card-header d-flex justify-content-between">
      <span></span>
      <button class="btn btn-outline-primary" @click="save">
        Sauvegarder
      </button>
    </div>
    <div class="card-body">
      <!-- NOM -->
      <div class="form-group">
        <label for="m-exe-des">Communication</label>
        <input
          type="text"
          class="form-control"
          id="m-exe-des"
          name="nom"
          v-model="activeExerciceData.communication"
        />
      </div>
      <!-- CATEGORIE -->
      <div class="form-group">
        <label for="m-sap-cat">Categorie</label>
        <select
          class="form-control required"
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
            <input
              type="date"
              class="form-control"
              id="m-exe-date"
              name="nom"
              v-model="activeExerciceData.date"
            />
          </div>
        </div>
        <div class="col-6">
          <!-- HEURE -->
          <div class="form-group">
            <label for="m-exe-heure">Heure</label>
            <input
              type="time"
              class="form-control"
              id="m-exe-heure"
              name="nom"
              v-model="activeExerciceData.heure"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- DUREE -->
          <div class="form-group">
            <label for="m-exe-duree">Durée</label>
            <input
              type="number"
              class="form-control"
              id="m-exe-duree"
              name="nom"
              v-model="activeExerciceData.duree"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- LOCALITE -->
          <div class="form-group">
            <label for="m-sap-localite">Localité</label>
            <select
              class="form-control required"
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
        <label for="m-sap-communication">Designation</label>
        <textarea
          type="text"
          class="form-control"
          id="m-sap-communication"
          name="nom"
          v-model="activeExerciceData.designation"
        />
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
      'listExerciceCategories'
    ])
  },
  methods: {
    save() {
      this.$store.dispatch('saveActiveExercice', this.activeExerciceData)
    }
  }
}
</script>

<style scoped></style>
