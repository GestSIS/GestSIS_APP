<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices</h3>
    </div>
    <div class="card-body">
      <table id="sap-fonctions" class="table" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Communication</th>
            <th>C</th>
            <th>P</th>
            <th>Ex</th>
            <th>Excuse</th>
            <th>A</th>
            <th>Solde</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in exerciceDisplay" :key="e.id">
            <td>{{ e.date }}</td>
            <td>{{ e.heure }}</td>
            <td>{{ e.categorie }}</td>
            <td>{{ e.localite }}</td>
            <td>{{ e.communications }}</td>
            <td>{{ e.convoque }}</td>
            <td>{{ e.present }}</td>
            <td>{{ e.excuse_id }}</td>
            <td>{{ e.excuse_id }}</td>
            <td>{{ e.amende_id }}</td>
            <td>0.0</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'SapeurTabExercice',
  computed: {
    ...mapState({
      activeSapeurId: state => state.sapeur.active.id,
      activeSapeurExercice: state => state.sapeur.active.exercices,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters(['getLocalite', 'getExerciceCategorie']),
    exerciceDisplay() {
      return this.activeSapeurExercice.map(exercice => {
        let localite = this.getLocalite(exercice.localite_id);
        return {
          ...exercice,
          categorie: this.getExerciceCategorie(exercice.exercice_categorie_id)
            .designation,
          localite: `${localite.npa} ${localite.designation}`,
          heure: exercice.heure.substr(0, 5)
        };
      });
    }
  },
  mounted() {
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurExercices', id);
    },
    currentExerciceComptableId() {
      this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
    }
  }
};
</script>

<style scoped></style>
