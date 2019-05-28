<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Saisie d'un cours</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="cours-date">Date du cours</label>
        <input
          type="date"
          v-model="activeCours.date"
          class="form-control"
          id="cours-date"
        />
      </div>
      <div class="form-group">
        <label for="cours-name">Cours</label>
        <select
          id="cours-name"
          v-model="activeCours.cours_id"
          class="form-control"
          :disabled="!addMode"
        >
          <option v-for="c in listCours" :key="c.id" :value="c.id">{{
            c.designation
          }}</option>
          <!-- TODO limiter le nombre de cours -->
        </select>
      </div>
      <div class="form-group">
        <label for="cours-localite">Localité</label>
        <select
          id="cours-localite"
          v-model="activeCours.localite_id"
          class="form-control"
        >
          <option v-for="l in listLocalites" :key="l.id" :value="l.id">{{
            l.designation
          }}</option>
        </select>
      </div>
      <div class="form-group" v-if="addMode">
        <label for="cours-precedent">Cours précédent</label>
        <select
          id="cours-precedent"
          v-model="activeCours.precedent_id"
          class="form-control select"
          disabled
        >
          <option value="0">-</option>
          <option v-for="c in listCours" :key="c.id" :value="c.id">{{
            c.designation
          }}</option>
          <!-- TODO Limiter le nombre de cours -->
        </select>
      </div>
      <div class="form-group" v-if="addMode">
        <label>Grade</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="form-group">
            <select v-model="activeCours.grade_id" class="form-control select">
              <option value="0">-</option>
              <option v-for="g in listGrades" :key="g.id" :value="g.id">{{
                g.designation
              }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <input type="date" class="form-control" />
          </div>
        </div>
      </div>

      <div class="form-group" v-if="addMode">
        <label>Fonction</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="form-group">
            <select
              v-model="activeCours.fonction_id"
              class="form-control select"
            >
              <option value="0">-</option>
              <option v-for="f in listFonctions" :key="f.id" :value="f.id">{{
                f.nom
              }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <input type="date" class="form-control" />
          </div>
        </div>
      </div>
      <div class="form-group" v-if="addMode">
        <label>Fonction remplacé</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="form-group">
            <select
              class="form-control"
              v-model="activeCours.fonction_sapeur_id"
            >
              <option value="0">-</option>
              <option
                v-for="f in activeSapeurFonctions"
                :key="f.id"
                :value="f.id"
                >{{ getFonction(f.fonction_id).nom }}</option
              >
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Close
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ addMode ? 'Ajouter' : 'Modifier' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalCours',
  computed: {
    ...mapGetters([
      'activeSapeurId',
      'activeSapeurFonctions',
      'listCours',
      'listFonctions',
      'listGrades',
      'listLocalites',
      'getCours',
      'getFonction',
      'activeCours'
    ]),
    addMode() {
      return (this.activeCours.id || 0) === 0
    },
    activeCoursId() {
      return this.activeCours.cours_id
    }
  },
  mounted() {
    if (this.activeSapeurFonctions.length === 0) {
      this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId)
    }

    if (this.listCours.length === 0) {
      this.$store.dispatch('fetchCours')
    }
    if (this.listFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions')
    }
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades')
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if (this.addMode) {
        this.$store.dispatch('addCours', this.activeCours).then(() => {
          this.HIDE_MODAL()
        })
      } else {
        this.$store.dispatch('editCours', this.activeCours).then(() => {
          this.HIDE_MODAL()
        })
      }
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id)
    },
    activeCoursId: function(cours_id) {
      console.log("Event change")
      let cours = this.listCours.filter(c => c.id === cours_id)[0]
      this.activeCours.fonction_id = cours.fonction_id || 0
      this.activeCours.grade_id = cours.grade_id || 0
      this.activeCours.precedent_id = cours.precedent_id || 0
      this.activeCours.fonction_sapeur_id = 0
      if (this.activeCours.fonction_id !== 0) {
        console.log(this.activeCours.fonction_id)
        let fonction = this.getFonction(this.activeCours.fonction_id)
        console.log(fonction)
        if (fonction.cumulable === 0) {
          let fonctions = this.activeSapeurFonctions.filter(
            f => this.getFonction(f.fonction_id).cumulable === 0
          )
          console.log(fonctions)
          if (fonctions.length > 0) {
            this.activeCours.fonction_sapeur_id = fonctions[0].id || 0
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
