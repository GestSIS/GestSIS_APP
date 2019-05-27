<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une fonction</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="debut">Début</label>
        <input type="date" class="form-control" id="debut" />
      </div>
      <div class="form-group">
        <label for="fin">Fin</label>
        <input type="date" class="form-control" id="fin" />
      </div>
      <div class="form-group">
        <label for="fonction">Fonction</label>
        <select id="fonction" v-model="fonction_id" class="form-control select">
          <option v-for="f in listFonctions" :key="f.id" :value="f.id">{{
            f.designation
            }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="remarque">Remarque</label>
        <input type="text" class="form-control" id="remarque" />
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
