<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter un cours</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="cours-date">Date du cours</label>
        <input type="date" class="form-control" id="cours-date" />
      </div>
      <!--          <h3>Paramètres pour la saisie d'un cours</h3>-->
      <div class="form-group">
        <label for="cours-name">Cours</label>
        <select id="cours-name" v-model="cours_id" class="form-control">
          <option v-for="c in listCours" :key="c.id" :value="c.id">{{
            c.designation
          }}</option>
          <!-- TODO limiter le nombre de cours -->
        </select>
      </div>
      <div class="form-group">
        <label for="cours-localite">Localité</label>
        <select id="cours-localite" class="form-control">
          <option v-for="l in listLocalites" :key="l.id">{{
            l.designation
          }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="cours-precedent">Cours précédent</label>
        <select id="cours-precedent" v-model="precedent_id" class="form-control">
          <option v-for="c in listCours" :key="c.id" :value="c.id">{{
            c.designation
          }}</option>
          <!-- TODO Limiter le nombre de cours -->
        </select>
      </div>
      <div class="form-group">
        <label>Grade</label>
      </div>
      <div class="row">
        <div class="col-md-8">
          <div class="form-group">
            <select v-model="grade_id" class="form-control select">
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

      <div class="form-group">
        <label>Fonction</label>
      </div>
      <div class="row">
        <div class="col-md-8">
          <div class="form-group">
            <select v-model="fonction_id" class="form-control select" disabled>
              <option v-for="f in listFonctions" :key="f.id" :value="f.id">{{
                f.designation
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
      <div class="form-group">
        <label>Fonction remplacé</label>
      </div>
      <div class="row">
        <div class="col-md-8">
          <div class="form-group">
            <select class="form-control" v-model="remplace_id" disabled>
              <option v-for="f in listFonctions" :key="f.id" :value="f.id">{{
                f.designation
              }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Close
      </button>
      <button type="button" class="btn btn-primary" @click="save()">Add</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalCours',
  data: function() {
    return {
      date: Date.now(),
      cours_id: 1,
      grade_id: 0,
      fonction_id: 0,
      precedent_id: 0,
      remplace_id: 0
    }
  },
  computed: {
    ...mapGetters([
      'activeSapeurId',
      'listCours',
      'listFonctions',
      'listGrades',
      'getCours',
      'listLocalites'
    ])
  },
  mounted() {
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
      //TODO SAVE
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id)
    },
    selectedCours: function(newOne) {
      this.cours = this.coursData.filter(elt => {
        return elt.id == newOne
      })[0]
      let id_fon = (this.fon_id = this.cours.id_fon)
      let id_gra = (this.gra_id = this.cours.id_gra)
      this.cou_pre_id = this.cours.prec
      if (id_gra > 0) {
        this.grade = this.gradeData.filter(elt => {
          return elt.id == id_gra
        })[0]
      }
      if (id_fon > 0) {
        this.fonction = this.fonctionData.filter(elt => {
          return elt.id == id_fon
        })[0]
      }
    }
  }
}
</script>

<style scoped></style>
