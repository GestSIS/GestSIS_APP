<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Exercices comptable</h5>
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
  name: 'ParametreTabExerciceComptable',
  computed: {
    ...mapGetters(['listExerciceComptable', 'activeExerciceComptableId']),
  },
  mounted() {
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      // let saveData = Object.assign({}, this.activeCours);
      // Object.keys(saveData).map(key => {
      //   saveData[key] =
      //     saveData[key] === 0 || saveData[key] === '0' ? null : saveData[key];
      // });

      // if (this.addMode) {
      //   this.$store.dispatch('addCours', saveData).then(() => {
      //     this.HIDE_MODAL();
      //     this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
      //     this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
      //   });
      // } else {
      //   this.$store.dispatch('editCours', saveData).then(() => {
      //     this.HIDE_MODAL();
      //     this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
      //   });
      // }
    },
  },
  watch: {
  }
};
</script>

<style scoped></style>
