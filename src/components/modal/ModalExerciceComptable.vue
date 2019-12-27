<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Saisie d'un cours</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body"></div>
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
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'ModalExerciceComptable',
  computed: {
    ...mapGetters(['listExerciceComptable', 'activeExerciceComptableId']),
    addMode() {
      return (this.activeCours.id || 0) === 0;
    },
    activeCoursId() {
      return this.activeCours.cours_id;
    },
    activesFonctions() {
      return this.activeSapeurFonctions.filter(f => f.fin === null);
    }
  },
  mounted() {
    if (this.activeSapeurFonctions.length === 0) {
      this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
    }

    if (this.listCours.length === 0) {
      this.$store.dispatch('fetchCours');
    }
    if (this.listFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      let saveData = Object.assign({}, this.activeCours);
      Object.keys(saveData).map(key => {
        saveData[key] =
          saveData[key] === 0 || saveData[key] === '0' ? null : saveData[key];
      });

      if (this.addMode) {
        this.$store.dispatch('addCours', saveData).then(() => {
          this.HIDE_MODAL();
          this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
          this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
        });
      } else {
        this.$store.dispatch('editCours', saveData).then(() => {
          this.HIDE_MODAL();
          this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
        });
      }
    },
    dateChange() {
      this.activeCours.date_grade = this.activeCours.date;
      this.activeCours.date_fonction = this.activeCours.date;
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id);
    },
    activeCoursId: function(cours_id) {
      let cours = this.listCours.filter(c => c.id === cours_id)[0];
      this.activeCours.fonction_id = cours.fonction_id || 0;
      this.activeCours.grade_id = cours.grade_id || 0;
      this.activeCours.precedent_id = cours.precedent_id || 0;
      this.activeCours.fonction_sapeur_id = 0;

      if (this.activeCours.fonction_id !== 0) {
        let fonction = this.getFonction(this.activeCours.fonction_id);
        if (fonction.cumulable === 0) {
          let fonctions = this.activesFonctions.filter(
            f => this.getFonction(f.fonction_id).cumulable === 0
          );
          if (fonctions.length > 0) {
            this.activeCours.fonction_sapeur_id = fonctions[0].id || 0;
          }
        }
      }
    }
  }
};
</script>

<style scoped></style>
