<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices</h3>
    </div>
    <div class="card-body">
      <table
        id="sap-fonctions"
        class="table table-sm"
        cellspacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Communication</th>
            <th>Convoqué</th>
            <th>Présent</th>
            <th>Excusé</th>
            <th>Amende</th>
            <!-- <th>Solde</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-if="exerciceDisplay.length <= 0">
            <td colspan="9">Aucun exercice à afficher</td>
          </tr>
          <tr v-for="e in exerciceDisplay" :key="e.id">
            <td>{{ e.date }}</td>
            <td>{{ e.heure }}</td>
            <td>{{ e.categorie }}</td>
            <td>{{ e.localite }}</td>
            <td>{{ e.communications }}</td>
            <td>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="convoque"
                  :checked="e.convoque"
                  disabled
                />
                <label class="custom-control-label" for="convoque"></label>
              </div>
            </td>
            <td>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="present"
                  :checked="e.present"
                  disabled
                />
                <label class="custom-control-label" for="present"></label>
              </div>
            </td>
            <td>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="excuse"
                  :checked="e.excuse_type_id"
                  disabled
                />
                <label class="custom-control-label" for="excuse">{{
                  e.excuse_type_id
                    ? getExcuseType(e.excuse_type_id).designation
                    : ''
                }}</label>
              </div>
            </td>
            <td>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="amende"
                  :checked="e.amende_id"
                  disabled
                />
                <label class="custom-control-label" for="amende"></label>
              </div>
            </td>
            <!-- <td>0.0</td> -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'SapeurExercice',
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['getLocalite', 'getExerciceCategorie', 'getExcuseType']),
    exerciceDisplay() {
      return this.activeSapeurExercice.map((exercice) => {
        let localite = this.getLocalite(exercice.localite_id);
        return {
          ...exercice,
          categorie: this.getExerciceCategorie(exercice.exercice_categorie_id)
            .designation,
          localite: `${localite.npa} ${localite.designation}`,
          heure: exercice.heure.substr(0, 5),
        };
      });
    },
  },
  mounted() {
    //TODO: Load before any display
    //TODO: Affichage solde ? Droits ?
    this.$store.dispatch('fetchExcuseTypes', this.activeSapeurId);
    this.$store.dispatch('fetchExerciceCategories', this.activeSapeurId);
    this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurExercices', id);
    },
    currentExerciceComptableId() {
      this.$store.dispatch('fetchSapeurExercices', this.activeSapeurId);
    },
  },
};
</script>

<style scoped></style>
